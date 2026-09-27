import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { AppError } from '../middleware/errorHandler';
import { validateParams } from '../middleware/validate';

const router = Router();

const listQuerySchema = z.object({
  category: z.string().min(1).max(40).optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const kitchenSummary = {
  id: true,
  name: true,
  avatarUrl: true,
  rating: true,
  reviewCount: true,
  location: true,
  verified: true,
} as const;

// GET /api/dishes?category=indian&search=biryani&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { category, search, page, limit } = listQuerySchema.parse(req.query);
    const where = {
      isActive: true,
      ...(category ? { category } : {}),
      ...(search
        ? { OR: [{ name: { contains: search } }, { description: { contains: search } }] }
        : {}),
    };
    const [total, data] = await Promise.all([
      prisma.dish.count({ where }),
      prisma.dish.findMany({
        where,
        include: { kitchen: { select: kitchenSummary } },
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

// GET /api/dishes/:id
router.get('/:id', validateParams(z.object({ id: z.string().min(1) })), async (req, res, next) => {
  try {
    const dish = await prisma.dish.findUnique({
      where: { id: req.params.id },
      include: { kitchen: { select: kitchenSummary } },
    });
    if (!dish) throw new AppError(404, 'Dish not found');
    res.json(dish);
  } catch (err) {
    next(err);
  }
});

export default router;
