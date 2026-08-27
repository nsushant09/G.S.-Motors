import jwt from 'jsonwebtoken';

const EXPIRES_IN = '7d';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function signAdminToken(): string {
  return jwt.sign({ role: 'admin' }, getSecret(), { expiresIn: EXPIRES_IN });
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, getSecret()) as { role?: string };
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
