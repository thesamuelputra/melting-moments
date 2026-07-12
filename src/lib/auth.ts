import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Admin session tokens — v2 format: `v2.<expiresAtMs>.<hmacHex>`
//   hmacHex = HMAC-SHA256(key = ADMIN_PASSWORD,
//                         message = 'melting-moments-admin-session.' + expiresAtMs)
//
// KEEP IN LOCKSTEP with src/proxy.ts (WebCrypto implementation for the
// middleware runtime). Any change to the format, message prefix, or expiry
// semantics must be mirrored there.
// ---------------------------------------------------------------------------

const TOKEN_MESSAGE_PREFIX = 'melting-moments-admin-session.';

/** Session lifetime: 7 days. Mirrored in src/proxy.ts (SESSION_DURATION_MS). */
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Name of the admin session cookie. Mirrored in src/proxy.ts. */
export const SESSION_COOKIE_NAME = 'admin_token';

/**
 * Thrown by requireAdmin() when the request has no valid admin session.
 * Server actions should catch this and map it to
 * `{ success: false, error: 'unauthorized' }`.
 */
export class AdminAuthError extends Error {
  readonly code = 'unauthorized' as const;
  constructor(message = 'Unauthorized: invalid or missing admin session.') {
    super(message);
    this.name = 'AdminAuthError';
  }
}

/**
 * Constant-time string comparison. Hashing both sides first normalizes
 * lengths so crypto.timingSafeEqual can be used without leaking length info.
 */
function safeEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

function hmacHex(secret: string, message: string): string {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * Mints a `v2.<expiresAtMs>.<hmacHex>` session token expiring at the given
 * epoch-ms timestamp. Used by the login action (and by proxy.ts via its own
 * WebCrypto twin for sliding renewal).
 */
export function createSessionToken(expiresAtMs: number): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured.');
  return `v2.${expiresAtMs}.${hmacHex(secret, TOKEN_MESSAGE_PREFIX + expiresAtMs)}`;
}

/**
 * Verifies a v2 session token: format, expiry, and HMAC (constant-time).
 * Old-format (v1, non-expiring) tokens fail here by design — holders simply
 * re-login.
 */
export function verifySessionToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v2') return false;

  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  // HMAC over the *string as it appears in the token* — no re-serialization.
  const expected = hmacHex(secret, TOKEN_MESSAGE_PREFIX + parts[1]);
  return safeEqual(parts[2], expected);
}

/**
 * Verifies the admin session cookie against the HMAC-signed, expiring token.
 * Must be called at the start of every server action that mutates data.
 * Throws AdminAuthError (code 'unauthorized') if the request is not from an
 * authenticated admin; throws a plain Error if ADMIN_PASSWORD is unset.
 */
export async function requireAdmin(): Promise<void> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_PASSWORD environment variable is not configured. Refusing to operate.');
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!verifySessionToken(token)) {
    throw new AdminAuthError();
  }
}

/**
 * Same check as requireAdmin(), but redirects to /admin-login instead of
 * throwing on auth failure. Called at the top of src/app/admin/layout.tsx as
 * defense in depth over the proxy middleware. A missing ADMIN_PASSWORD still
 * throws (server misconfiguration, not an auth failure).
 */
export async function requireAdminOrRedirect(): Promise<void> {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAuthError) {
      redirect('/admin-login');
    }
    throw err;
  }
}
