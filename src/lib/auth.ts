import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Constant-time string comparison. Hashing both sides first normalizes
 * lengths so crypto.timingSafeEqual can be used without leaking length info.
 */
function safeEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

/**
 * Verifies the admin session cookie against the HMAC-signed token.
 * Must be called at the start of every server action that mutates data.
 * Throws if the request is not from an authenticated admin.
 */
export async function requireAdmin(): Promise<void> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_PASSWORD environment variable is not configured. Refusing to operate.');
  }

  const expectedToken = crypto
    .createHmac('sha256', secret)
    .update('melting-moments-admin-session')
    .digest('hex');

  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !safeEqual(token, expectedToken)) {
    throw new Error('Unauthorized: invalid or missing admin session.');
  }
}
