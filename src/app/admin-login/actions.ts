'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/lib/auth';

// Constant-time string comparison. Hashing both sides first normalizes
// lengths so crypto.timingSafeEqual can be used without leaking length info.
function safeEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

// In-memory rate limiter for login attempts.
// Per-IP exponential backoff after MAX_ATTEMPTS failures, plus a global cap
// so distributed guessing across many IPs is still throttled. In-memory and
// per-instance: resets on cold start (acceptable for a single-admin site).
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;             // per-IP failures before backoff kicks in
const BASE_LOCKOUT_MS = 30_000;     // 30 seconds, doubling per extra failure
const GLOBAL_KEY = '__global__';
// The per-IP limiter is the primary defense (x-forwarded-for is platform-set
// on Vercel). The global cap is a coarse backstop against distributed
// guessing; set well above ambient bot noise so accumulated stray failures
// can never lock out the real admin, and cleared on every successful login.
const GLOBAL_MAX_ATTEMPTS = 100;
const STALE_ENTRY_MS = 60 * 60 * 1000; // prune records idle for 1h
let lastPruneAt = 0;

// Evict stale records so the map cannot grow without bound on a long-lived
// instance (one entry per attacking IP otherwise lives forever).
function pruneLoginAttempts(now: number) {
  if (now - lastPruneAt < 60_000) return;
  lastPruneAt = now;
  for (const [key, record] of loginAttempts) {
    if (now - record.lastAttempt > STALE_ENTRY_MS) {
      loginAttempts.delete(key);
    }
  }
}

async function getClientKey(): Promise<string> {
  // Key by IP so one guesser cannot lock out the real admin, while the
  // GLOBAL_KEY bucket still caps distributed attempts across IPs.
  const headerStore = await headers();
  return headerStore.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headerStore.get('x-real-ip')
    || 'unknown';
}

function checkRateLimit(key: string, maxAttempts: number): { blocked: boolean; retryAfterSeconds?: number } {
  pruneLoginAttempts(Date.now());
  const record = loginAttempts.get(key);
  if (!record || record.count < maxAttempts) return { blocked: false };

  // Exponential backoff: 30s, 60s, 120s... capped at 32min so an active
  // lockout always stays shorter than the 1h stale-entry prune window.
  const lockoutMs = BASE_LOCKOUT_MS * Math.pow(2, Math.min(record.count - maxAttempts, 6));
  const elapsed = Date.now() - record.lastAttempt;

  if (elapsed < lockoutMs) {
    return { blocked: true, retryAfterSeconds: Math.ceil((lockoutMs - elapsed) / 1000) };
  }

  return { blocked: false };
}

function recordFailedAttempt(key: string) {
  const record = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
  record.count += 1;
  record.lastAttempt = Date.now();
  loginAttempts.set(key, record);

  // Log for intrusion detection
  console.warn(`[Auth] Failed login attempt #${record.count} (key: ${key}) at ${new Date().toISOString()}`);
}

function clearAttempts(key: string) {
  loginAttempts.delete(key);
}

export async function login(formData: FormData) {
  const key = await getClientKey();

  // Check per-IP limit, then the global cap.
  let rateCheck = checkRateLimit(key, MAX_ATTEMPTS);
  if (!rateCheck.blocked) rateCheck = checkRateLimit(GLOBAL_KEY, GLOBAL_MAX_ATTEMPTS);
  if (rateCheck.blocked) {
    console.warn(`[Auth] Rate-limited login attempt blocked. Retry after ${rateCheck.retryAfterSeconds}s`);
    return { error: `Too many attempts. Try again in ${rateCheck.retryAfterSeconds} seconds.` };
  }

  const password = formData.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookieStore = await cookies();

  if (typeof password === 'string' && adminPassword && safeEqual(password, adminPassword)) {
    clearAttempts(key);
    clearAttempts(GLOBAL_KEY); // a successful login proves the admin is not locked out, so reset the backstop
    // v2 expiring token; see src/lib/auth.ts and src/proxy.ts for the format.
    const token = createSessionToken(Date.now() + SESSION_DURATION_MS);
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000, // 1 week
    });
    redirect('/admin');
  }

  recordFailedAttempt(key);
  recordFailedAttempt(GLOBAL_KEY);
  return { error: 'Invalid password' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/admin-login');
}
