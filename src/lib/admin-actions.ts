import { AdminAuthError, requireAdmin } from '@/lib/auth';

/**
 * Shared result shape for the admin server actions. Success optionally
 * carries the created document id; failures carry a machine-readable error
 * plus an optional human-readable message.
 */
export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };

const UNAUTHORIZED = { success: false, error: 'unauthorized' } as const;

/**
 * Maps AdminAuthError to the shared unauthorized failure; returns null when
 * the caller is authenticated. A missing ADMIN_PASSWORD env (plain Error) is
 * a server misconfiguration and is intentionally rethrown.
 */
export async function ensureAdmin(): Promise<typeof UNAUTHORIZED | null> {
  try {
    await requireAdmin();
    return null;
  } catch (err) {
    if (err instanceof AdminAuthError) return UNAUTHORIZED;
    throw err;
  }
}
