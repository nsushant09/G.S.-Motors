import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { loginSchema } from '../schemas/admin';
import { signAdminToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) {
    throw new AppError(500, 'INTERNAL_ERROR', 'Admin account is not configured');
  }

  const emailMatches = email.toLowerCase() === adminEmail.toLowerCase();
  const passwordMatches = await bcrypt.compare(password, adminHash);

  if (!emailMatches || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const token = signAdminToken();
  res.json({ data: { token } });
}
