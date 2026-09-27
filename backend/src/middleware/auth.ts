import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../enums';
import { AppError } from './errorHandler';

export interface AuthUser {
  id: string;
  role: Role;
}

// Extend Express's Request type so handlers can read req.user after requireAuth.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface JwtPayload {
  sub: string;
  role: Role;
}

export function signToken(user: { id: string; role: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  const role = (Object.values(Role) as string[]).includes(user.role)
    ? (user.role as Role)
    : Role.CUSTOMER;
  return jwt.sign({ sub: user.id, role } satisfies JwtPayload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions);
}

/** Rejects requests without a valid `Authorization: Bearer <token>` header. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or malformed Authorization header');
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  try {
    const payload = jwt.verify(header.slice(7), secret) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}

/** Restricts a route to specific roles. Use after requireAuth. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new AppError(401, 'Authentication required');
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, `Requires role: ${roles.join(' or ')}`);
    }
    next();
  };
}
