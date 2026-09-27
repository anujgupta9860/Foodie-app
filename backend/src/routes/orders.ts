import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validate';
import { createPaymentIntent } from '../stripe';

const router = Router();
router.use(requireAuth);

const idParams = validateParams(z.object({ id: z.string().min(1) }));

const createOrderSchema = z.object({
  items: z
    .array(z.object({ dishId: z.string().min(1), qty: z.number().int().min(1).max(20) }))
    .min(1)
    .max(20),
  paymentMethod: z.string().min(1).max(40),
  pickupSlot: z.string().min(1).max(60),
});

const reviewSchema = z.object({
  overall: z.number().int().min(1).max(5),
  quality: z.number().int().min(1).max(5),
  packaging: z.number().int().min(1).max(5),
  accuracy: z.number().int().min(1).max(5),
  comment: z.string().max(1000).default(''),
});

// Human-readable order ids like FD123456 (retries on the rare collision).
async function generateOrderId(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const id = `FD${Math.floor(100000 + Math.random() * 900000)}`;
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return id;
  }
  throw new AppError(500, 'Could not generate order id');
}

const orderInclude = {
  items: true,
  kitchen: { select: { id: true, name: true, avatarUrl: true, location: true } },
} as const;

// POST /api/orders — place an order (single kitchen per order: one pickup spot).
router.post('/', validateBody(createOrderSchema), async (req, res, next) => {
  try {
    const { items, paymentMethod, pickupSlot } = createOrderSchema.parse(req.body);
    const customerId = req.user!.id;

    const dishIds = [...new Set(items.map((i) => i.dishId))];
    const dishes = await prisma.dish.findMany({
      where: { id: { in: dishIds } },
      include: { kitchen: { select: { id: true } } },
    });
    if (dishes.length !== dishIds.length) throw new AppError(404, 'One or more dishes not found');

    const kitchenId = dishes[0].kitchenId;
    for (const d of dishes) {
      if (!d.isActive) throw new AppError(409, `"${d.name}" is no longer available`);
      if (d.kitchenId !== kitchenId) {
        throw new AppError(400, 'All items in an order must come from the same kitchen');
      }
    }
    for (const item of items) {
      const dish = dishes.find((d) => d.id === item.dishId)!;
      if (item.qty > dish.quantityLeft) {
        throw new AppError(409, `Only ${dish.quantityLeft} portion(s) of "${dish.name}" left`);
      }
    }

    const subtotalCents = items.reduce((sum, item) => {
      const dish = dishes.find((d) => d.id === item.dishId)!;
      return sum + dish.priceCents * item.qty;
    }, 0);
    const serviceFeeCents = 0;
    const totalCents = subtotalCents + serviceFeeCents;

    // Stripe is stubbed in src/stripe.ts — returns a mock PaymentIntent locally.
    const paymentIntent = await createPaymentIntent({ amountCents: totalCents, customerId });
    const orderId = await generateOrderId();

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          id: orderId,
          customerId,
          kitchenId,
          status: 'NEW',
          subtotalCents,
          serviceFeeCents,
          totalCents,
          paymentMethod,
          pickupSlot,
          paymentIntentId: paymentIntent.id,
          items: {
            create: items.map((item) => {
              const dish = dishes.find((d) => d.id === item.dishId)!;
              return {
                dishId: dish.id,
                nameSnapshot: dish.name,
                priceCentsSnapshot: dish.priceCents,
                qty: item.qty,
              };
            }),
          },
        },
        include: orderInclude,
      });
      // Decrement stock inside the same transaction; re-check to avoid oversell.
      for (const item of items) {
        const updated = await tx.dish.updateMany({
          where: { id: item.dishId, quantityLeft: { gte: item.qty } },
          data: { quantityLeft: { decrement: item.qty } },
        });
        if (updated.count === 0) {
          throw new AppError(409, 'A dish sold out while placing your order — please try again');
        }
      }
      return created;
    });

    res.status(201).json({ order, paymentIntent });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/mine — the signed-in customer's orders, newest first.
router.get('/mine', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.id },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — visible to the customer, the kitchen owner, or an admin.
router.get('/:id', idParams, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { ...orderInclude, kitchen: { select: { id: true, name: true, ownerId: true } } },
    });
    if (!order) throw new AppError(404, 'Order not found');
    const user = req.user!;
    const isOwner = order.customerId === user.id;
    const isMaker = order.kitchen.ownerId === user.id;
    if (!isOwner && !isMaker && user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to view this order');
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/review — rate a completed order (one review per order).
router.post('/:id/review', idParams, validateBody(reviewSchema), async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { review: true },
    });
    if (!order) throw new AppError(404, 'Order not found');
    if (order.customerId !== req.user!.id) throw new AppError(403, 'Only the customer can review');
    if (order.status !== 'COMPLETED') throw new AppError(409, 'Only completed orders can be reviewed');
    if (order.review) throw new AppError(409, 'This order has already been reviewed');

    const { overall, quality, packaging, accuracy, comment } = reviewSchema.parse(req.body);

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          orderId: order.id,
          customerId: req.user!.id,
          kitchenId: order.kitchenId,
          overall,
          quality,
          packaging,
          accuracy,
          comment,
        },
      });
      // Rolling average update for the kitchen's rating.
      const kitchen = await tx.kitchen.findUniqueOrThrow({ where: { id: order.kitchenId } });
      const reviewCount = kitchen.reviewCount + 1;
      const rating = (kitchen.rating * kitchen.reviewCount + overall) / reviewCount;
      await tx.kitchen.update({ where: { id: kitchen.id }, data: { rating, reviewCount } });
      return created;
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

export default router;
