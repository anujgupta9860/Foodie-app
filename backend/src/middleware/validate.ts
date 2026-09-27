import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

// Thin wrappers around zod's parse(). A ZodError is thrown synchronously and
// converted to a 400 JSON response by errorHandler.

export const validateBody = (schema: ZodTypeAny) => (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  req.body = schema.parse(req.body);
  next();
};

export const validateParams = (schema: ZodTypeAny) => (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  req.params = schema.parse(req.params) as Record<string, string>;
  next();
};
