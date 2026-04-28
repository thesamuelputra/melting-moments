import { cookies } from 'next/headers';
import crypto from 'crypto';

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

  if (!token || token !== expectedToken) {
    throw new Error('Unauthorized: invalid or missing admin session.');
  }
}
