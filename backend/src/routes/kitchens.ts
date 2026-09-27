import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateParams } from '../middleware/validate';

const router = Router();
const idParams = validateParams(z.object({ id: z.string().min(1) }));

// GET /api/kitchens — list all active kitchens, newest first.
router.get('/', async (_req, res, next) => {
  try {
    const kitchens = await prisma.kitchen.findMany({
      where: { isActive: true },
      include: { _count: { select: { dishes: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: kitchens });
  } catch (err) {
    next(err);
  }
});

// GET /api/kitchens/:id — profile, active dishes, recent reviews
router.get('/:id', idParams, async (req, res, next) => {
  try {
    const kitchen = await prisma.kitchen.findUnique({
      where: { id: req.params.id },
      include: {
        dishes: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { customer: { select: { name: true } } },
        },
        _count: { select: { follows: true } },
      },
    });
    if (!kitchen) throw new AppError(404, 'Kitchen not found');
    res.json(kitchen);
  } catch (err) {
    next(err);
  }
});

// GET /api/kitchens/:id/dishes — today's menu
router.get('/:id/dishes', idParams, async (req, res, next) => {
  try {
    const kitchen = await prisma.kitchen.findUnique({ where: { id: req.params.id } });
    if (!kitchen) throw new AppError(404, 'Kitchen not found');
    const dishes = await prisma.dish.findMany({
      where: { kitchenId: kitchen.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(dishes);
  } catch (err) {
    next(err);
  }
});

// POST /api/kitchens/:id/follow — follow a kitchen
router.post('/:id/follow', requireAuth, idParams, async (req, res, next) => {
  try {
    const kitchenId = req.params.id;
    const customerId = req.user!.id;
    const kitchen = await prisma.kitchen.findUnique({ where: { id: kitchenId } });
    if (!kitchen) throw new AppError(404, 'Kitchen not found');
    const already = await prisma.follow.findUnique({
      where: { customerId_kitchenId: { customerId, kitchenId } },
    });
    if (already) return res.status(200).json({ following: true }); // idempotent
    await prisma.$transaction([
      prisma.follow.create({ data: { customerId, kitchenId } }),
      prisma.kitchen.update({
        where: { id: kitchenId },
        data: { followerCount: { increment: 1 } },
      }),
    ]);
    res.status(201).json({ following: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/kitchens/:id/follow — unfollow a kitchen
router.delete('/:id/follow', requireAuth, idParams, async (req, res, next) => {
  try {
    const kitchenId = req.params.id;
    const customerId = req.user!.id;
    const existing = await prisma.follow.findUnique({
      where: { customerId_kitchenId: { customerId, kitchenId } },
    });
    if (!existing) throw new AppError(404, 'Not following this kitchen');
    await prisma.$transaction([
      prisma.follow.delete({ where: { customerId_kitchenId: { customerId, kitchenId } } }),
      prisma.kitchen.update({
        where: { id: kitchenId },
        data: { followerCount: { decrement: 1 } },
      }),
    ]);
    res.json({ following: false });
  } catch (err) {
    next(err);
  }
});

export default router;
