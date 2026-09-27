import { Router } from 'express';

const router = Router();

// GET /health — liveness probe (mounted outside /api).
router.get('/', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
