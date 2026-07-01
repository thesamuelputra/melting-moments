'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

// Constant-time string comparison. Hashing both sides first normalizes
// lengths so crypto.timingSafeEqual can be used without leaking length info.
function safeEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

// Generate a signed token from the password to prevent cookie guessing
function generateToken(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured.');
  return crypto.createHmac('sha256', secret).update('melting-moments-admin-session').digest('hex');
}

// In-memory rate limiter for login attempts.
// Tracks failed attempts and enforces exponential backoff.
// Resets on successful login. Cleared on server restart (acceptable for single-instance).
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 30_000; // 30 seconds

function getClientKey(): string {
  // For a single-admin site, a global key is the correct defense.
  // Server actions don't expose request headers (no IP available),
  // and keying by password hash allows unlimited attempts with
  // different passwords. A single bucket rate-limits ALL attempts.
  return 'global_login';
}

function checkRateLimit(key: string): { blocked: boolean; retryAfterSeconds?: number } {
  const record = loginAttempts.get(key);
  if (!record || record.count < MAX_ATTEMPTS) return { blocked: false };
  
  // Exponential backoff: 30s, 60s, 120s, 240s...
  const lockoutMs = BASE_LOCKOUT_MS * Math.pow(2, record.count - MAX_ATTEMPTS);
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
  console.warn(`[Auth] Failed login attempt #${record.count} at ${new Date().toISOString()}`);
}

function clearAttempts(key: string) {
  loginAttempts.delete(key);
}

export async function login(formData: FormData) {
  const key = getClientKey();
  
  // Check rate limit
  const rateCheck = checkRateLimit(key);
  if (rateCheck.blocked) {
    console.warn(`[Auth] Rate-limited login attempt blocked. Retry after ${rateCheck.retryAfterSeconds}s`);
    return { error: `Too many attempts. Try again in ${rateCheck.retryAfterSeconds} seconds.` };
  }
  
  const password = formData.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookieStore = await cookies();

  if (typeof password === 'string' && adminPassword && safeEqual(password, adminPassword)) {
    clearAttempts(key);
    const token = generateToken();
    cookieStore.set('admin_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    redirect('/admin');
  }
  
  recordFailedAttempt(key);
  return { error: 'Invalid password' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin-login');
}
