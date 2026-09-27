import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/errorHandler';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import dishesRouter from './routes/dishes';
import kitchensRouter from './routes/kitchens';
import ordersRouter from './routes/orders';
import makerRouter from './routes/maker';
import adminRouter from './routes/admin';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  // Liveness probe lives outside /api.
  app.use('/health', healthRouter);

  app.use('/api/auth', authRouter);
  app.use('/api/dishes', dishesRouter);
  app.use('/api/kitchens', kitchensRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/maker', makerRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
