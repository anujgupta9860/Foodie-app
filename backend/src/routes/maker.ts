import { Router } from 'express';
import { z } from 'zod';
import { OrderStatus } from '../enums';
import { prisma } from '../prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validate';

const router = Router();
router.use(requireAuth, requireRole('MAKER'));

const idParams = validateParams(z.object({ id: z.string().min(1) }));

// Every maker owns exactly one kitchen; resolve it or 404.
async function makerKitchen(userId: string) {
  const kitchen = await prisma.kitchen.findUnique({ where: { ownerId: userId } });
  if (!kitchen) throw new AppError(404, 'You have not created a kitchen yet');
  return kitchen;
}

const COMMISSION_RATE = 0.1; // 10% platform commission

const createKitchenSchema = z.object({
  name: z.string().min(1).max(80),
  about: z.string().max(500).default(''),
  location: z.string().max(120).default(''),
  avatarUrl: z.string().url().max(500).optional(),
  bannerUrl: z.string().url().max(500).optional(),
});

const updateKitchenSchema = createKitchenSchema.partial();

const tagsInput = z.union([z.string(), z.array(z.string())]).optional();
const normalizeTags = (tags: string | string[] | undefined): string =>
  Array.isArray(tags) ? tags.join(', ') : (tags ?? '');

const createDishSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(1000).default(''),
  priceCents: z.number().int().min(1),
  category: z.string().min(1).max(40),
  tags: tagsInput,
  portion: z.string().max(80).default(''),
  quantityTotal: z.number().int().min(0),
  pickupStart: z.string().max(20).default(''),
  pickupEnd: z.string().max(20).default(''),
  imageUrl: z.string().url().max(500).optional(),
});

const updateDishSchema = createDishSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// GET /api/maker/kitchen — the signed-in maker's kitchen (404 if none yet).
router.get('/kitchen', async (req, res, next) => {
  try {
    const kitchen = await prisma.kitchen.findUnique({ where: { ownerId: req.user!.id } });
    if (!kitchen) throw new AppError(404, 'No kitchen yet — create one to get started');
    res.json(kitchen);
  } catch (err) {
    next(err);
  }
});

// POST /api/maker/kitchens — create your kitchen (one per maker).
router.post('/kitchens', validateBody(createKitchenSchema), async (req, res, next) => {
  try {
    const existing = await prisma.kitchen.findUnique({ where: { ownerId: req.user!.id } });
    if (existing) throw new AppError(409, 'You already have a kitchen');
    const data = createKitchenSchema.parse(req.body);
    const kitchen = await prisma.kitchen.create({
      data: { ...data, ownerId: req.user!.id, verified: false },
    });
    res.status(201).json(kitchen);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/maker/kitchens/:id — edit your kitchen.
router.patch('/kitchens/:id', idParams, validateBody(updateKitchenSchema), async (req, res, next) => {
  try {
    const kitchen = await makerKitchen(req.user!.id);
    if (kitchen.id !== req.params.id) throw new AppError(403, 'Not your kitchen');
    const data = updateKitchenSchema.parse(req.body);
    const updated = await prisma.kitchen.update({ where: { id: kitchen.id }, data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// GET /api/maker/dishes — all dishes for your kitchen (including inactive).
router.get('/dishes', async (req, res, next) => {
  try {
    const kitchen = await makerKitchen(req.user!.id);
    const dishes = await prisma.dish.findMany({
      where: { kitchenId: kitchen.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(dishes);
  } catch (err) {
    next(err);
  }
});

// POST /api/maker/dishes — list a new dish.
router.post('/dishes', validateBody(createDishSchema), async (req, res, next) => {
  try {
    const kitchen = await makerKitchen(req.user!.id);
    const data = createDishSchema.parse(req.body);
    const dish = await prisma.dish.create({
      data: {
        kitchenId: kitchen.id,
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        category: data.category,
        tags: normalizeTags(data.tags),
        portion: data.portion,
        quantityTotal: data.quantityTotal,
        quantityLeft: data.quantityTotal,
        pickupStart: data.pickupStart,
        pickupEnd: data.pickupEnd,
        imageUrl: data.imageUrl,
      },
    });
    res.status(201).json(dish);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/maker/dishes/:id — edit a dish, incl. isActive toggle.
router.patch('/dishes/:id', idParams, validateBody(updateDishSchema), async (req, res, next) => {
  try {
    const kitchen = await makerKitchen(req.user!.id);
    const dish = await prisma.dish.findUnique({ where: { id: req.params.id } });
    if (!dish || dish.kitchenId !== kitchen.id) throw new AppError(404, 'Dish not found');
    const data = updateDishSchema.parse(req.body);
    const { tags, ...rest } = data;
    const updated = await prisma.dish.update({
      where: { id: dish.id },
      data: { ...rest, ...(tags !== undefined ? { tags: normalizeTags(tags) } : {}) },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

const makerOrderQuerySchema = z.object({ status: z.nativeEnum(OrderStatus).optional() });

// GET /api/maker/orders?status=NEW — incoming orders for your kitchen.
router.get('/orders', async (req, res, next) => {
  try {
    const kitchen = await makerKitchen(req.user!.id);
    const { status } = makerOrderQuerySchema.parse(req.query);
    const orders = await prisma.order.findMany({
      where: { kitchenId: kitchen.id, ...(status ? { status } : {}) },
      include: {
        items: true,
        customer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/maker/orders/:id { action: accept | reject }
router.patch(
  '/orders/:id',
  idParams,
  validateBody(z.object({ action: z.enum(['accept', 'reject']) })),
  async (req, res, next) => {
    try {
      const kitchen = await makerKitchen(req.user!.id);
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });
      if (!order || order.kitchenId !== kitchen.id) throw new AppError(404, 'Order not found');
      if (order.status !== 'NEW') throw new AppError(409, `Order is already ${order.status}`);

      const { action } = req.body as { action: 'accept' | 'reject' };
      const updated = await prisma.$transaction(async (tx) => {
        if (action === 'accept') {
          return tx.order.update({ where: { id: order.id }, data: { status: 'ACTIVE' } });
        }
        // Reject: cancel the order and restore stock.
        const cancelled = await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        });
        for (const item of order.items) {
          await tx.dish.update({
            where: { id: item.dishId },
            data: { quantityLeft: { increment: item.qty } },
          });
        }
        return cancelled;
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/maker/earnings — summary + 12-week payout series + payouts.
router.get('/earnings', async (req, res, next) => {
  try {
    const kitchen = await makerKitchen(req.user!.id);
    const completed = await prisma.order.findMany({
      where: { kitchenId: kitchen.id, status: 'COMPLETED' },
      select: { totalCents: true, createdAt: true },
    });
    const grossCents = completed.reduce((s, o) => s + o.totalCents, 0);
    const commissionCents = Math.round(grossCents * COMMISSION_RATE);
    const tipsCents = 0; // tips are not collected yet
    const netCents = grossCents - commissionCents + tipsCents;

    // Bucket completed-order revenue into the last 12 ISO weeks (oldest first).
    const weeks: { week: string; grossCents: number }[] = [];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)); // Monday
    for (let i = 11; i >= 0; i--) {
      const wStart = new Date(startOfWeek);
      wStart.setDate(wStart.getDate() - i * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 7);
      const gross = completed
        .filter((o) => o.createdAt >= wStart && o.createdAt < wEnd)
        .reduce((s, o) => s + o.totalCents, 0);
      weeks.push({ week: wStart.toISOString().slice(0, 10), grossCents: gross });
    }

    const payouts = await prisma.payout.findMany({
      where: { kitchenId: kitchen.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      summary: { grossCents, commissionCents, tipsCents, netCents, commissionRate: COMMISSION_RATE },
      weekly: weeks,
      payouts,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/maker/dashboard — today's sales, open orders, food remaining.
router.get('/dashboard', async (req, res, next) => {
  try {
    const kitchen = await makerKitchen(req.user!.id);
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const [todayOrders, openCount, dishes] = await Promise.all([
      prisma.order.findMany({
        where: {
          kitchenId: kitchen.id,
          createdAt: { gte: dayStart },
          status: { in: ['ACTIVE', 'COMPLETED'] },
        },
        select: { totalCents: true },
      }),
      prisma.order.count({
        where: { kitchenId: kitchen.id, status: { in: ['NEW', 'ACTIVE'] } },
      }),
      prisma.dish.findMany({
        where: { kitchenId: kitchen.id, isActive: true },
        select: { quantityLeft: true },
      }),
    ]);

    res.json({
      todaySalesCents: todayOrders.reduce((s, o) => s + o.totalCents, 0),
      orderCount: openCount,
      foodRemaining: dishes.reduce((s, d) => s + d.quantityLeft, 0),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
