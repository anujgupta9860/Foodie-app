import { Router } from 'express';
import { z } from 'zod';
import { OrderStatus } from '../enums';
import { prisma } from '../prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validate';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const orderListQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(OrderStatus).optional(),
});

// GET /api/admin/stats — platform overview.
router.get('/stats', async (_req, res, next) => {
  try {
    const [userCount, kitchenCount, dishCount, orderCount, completed] = await Promise.all([
      prisma.user.count(),
      prisma.kitchen.count(),
      prisma.dish.count(),
      prisma.order.count(),
      prisma.order.findMany({ where: { status: 'COMPLETED' }, select: { totalCents: true } }),
    ]);
    res.json({
      userCount,
      kitchenCount,
      dishCount,
      orderCount,
      gmvCents: completed.reduce((s, o) => s + o.totalCents, 0),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users?page=&limit=
router.get('/users', async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const [total, data] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
          _count: { select: { kitchens: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    res.json({ data, page, limit, total });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders?page=&limit=&status=
router.get('/orders', async (req, res, next) => {
  try {
    const { page, limit, status } = orderListQuerySchema.parse(req.query);
    const where = status ? { status } : {};
    const [total, data] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: { select: { id: true, name: true, email: true } },
          kitchen: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    res.json({ data, page, limit, total });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/payouts
router.get('/payouts', async (_req, res, next) => {
  try {
    const payouts = await prisma.payout.findMany({
      include: { kitchen: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payouts);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/kitchens/:id/verify — approve or revoke a kitchen.
router.patch(
  '/kitchens/:id/verify',
  validateParams(z.object({ id: z.string().min(1) })),
  validateBody(z.object({ verified: z.boolean() })),
  async (req, res, next) => {
    try {
      const kitchen = await prisma.kitchen.findUnique({ where: { id: req.params.id } });
      if (!kitchen) throw new AppError(404, 'Kitchen not found');
      const updated = await prisma.kitchen.update({
        where: { id: kitchen.id },
        data: { verified: (req.body as { verified: boolean }).verified },
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
