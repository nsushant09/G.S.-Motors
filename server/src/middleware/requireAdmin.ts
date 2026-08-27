import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !verifyAdminToken(token)) {
    throw new AppError(401, 'UNAUTHORIZED', 'Admin login required');
  }
  next();
}
