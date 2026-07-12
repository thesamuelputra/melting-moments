import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Admin session tokens — v2 format: `v2.<expiresAtMs>.<hmacHex>`
//   hmacHex = HMAC-SHA256(key = ADMIN_PASSWORD,
//                         message = 'melting-moments-admin-session.' + expiresAtMs)
//
// KEEP IN LOCKSTEP with src/lib/auth.ts (Node crypto implementation used by
// server actions). This file uses WebCrypto because the proxy (middleware)
// runtime has no Node `crypto` module. Any change to the format, message
// prefix, or expiry semantics must be mirrored there.
// ---------------------------------------------------------------------------

const TOKEN_MESSAGE_PREFIX = 'melting-moments-admin-session.';
const SESSION_COOKIE_NAME = 'admin_token';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — mirror of src/lib/auth.ts
// Sliding renewal: mint a fresh token when less than half the lifetime remains.
const RENEWAL_THRESHOLD_MS = 3.5 * 24 * 60 * 60 * 1000;

async function hmacHex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b: number) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Constant-time string comparison (proxy runtime has no crypto.timingSafeEqual)
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifies a v2 session token (format, expiry, HMAC — constant-time).
 * Returns the token's expiry (epoch ms) when valid, or null when invalid.
 * Old-format (v1, non-expiring) tokens fail here by design → re-login.
 */
async function verifySessionToken(token: string | undefined): Promise<number | null> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token) return null;

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v2') return null;

  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  // HMAC over the *string as it appears in the token* — no re-serialization.
  const expected = await hmacHex(secret, TOKEN_MESSAGE_PREFIX + parts[1]);
  return timingSafeEqual(parts[2], expected) ? expiresAt : null;
}

async function createSessionToken(expiresAtMs: number, secret: string): Promise<string> {
  return `v2.${expiresAtMs}.${await hmacHex(secret, TOKEN_MESSAGE_PREFIX + expiresAtMs)}`;
}

// ---------- Contact API Rate Limiter ----------
// Sliding window: max 10 requests per minute per IP
const contactRateMap = new Map<string, number[]>();
const CONTACT_RATE_LIMIT = 10;
const CONTACT_WINDOW_MS = 60_000;
let lastContactPruneAt = 0;

// Evict IPs whose every timestamp fell out of the window — otherwise the map
// grows without bound on long-lived instances (stale keys were previously
// filtered per-lookup but never removed).
function pruneContactRateMap(now: number) {
  if (now - lastContactPruneAt < CONTACT_WINDOW_MS) return;
  lastContactPruneAt = now;
  for (const [ip, timestamps] of contactRateMap) {
    if (!timestamps.some(t => now - t < CONTACT_WINDOW_MS)) {
      contactRateMap.delete(ip);
    }
  }
}

function isContactRateLimited(ip: string): boolean {
  const now = Date.now();
  pruneContactRateMap(now);
  const timestamps = (contactRateMap.get(ip) || []).filter(t => now - t < CONTACT_WINDOW_MS);

  if (timestamps.length >= CONTACT_RATE_LIMIT) {
    contactRateMap.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  contactRateMap.set(ip, timestamps);
  return false;
}

// ---------- Security Headers ----------
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy — restrict script/style sources
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  // HSTS: force HTTPS for 2 years incl. subdomains (browsers ignore it over http://localhost)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // X-XSS-Protection is deprecated and the legacy auditor can itself introduce
  // vulnerabilities; explicitly disable it (CSP is the real XSS defense).
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CSP: allow self, inline styles (needed for Next.js), and common CDNs.
  // 'unsafe-eval' is dev-only: React/Next need eval for HMR + debug builds,
  // but production builds run without it (per Next's own CSP guide).
  const scriptEval = process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : '';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${scriptEval} https://va.vercel-scripts.com`,  // Next.js inline/runtime + Vercel Analytics
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.resend.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export async function proxy(request: NextRequest) {
  // --- guidosgourmet.ca domain redirect (path-preserving) ---
  const host = request.headers.get('host') || '';
  if (host.includes('guidosgourmet')) {
    const path = request.nextUrl.pathname === '/'
      ? '/guidos'
      : `/guidos${request.nextUrl.pathname}`;
    return NextResponse.redirect(
      new URL(path, 'https://meltingmoments.ca'),
      301
    );
  }

  // --- Contact & Order API Rate Limiting ---
  const rateLimitedPaths = ['/api/contact', '/api/guidos-order'];
  if (rateLimitedPaths.includes(request.nextUrl.pathname) && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (isContactRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // --- Already authenticated? /admin-login → /admin ---
  if (request.nextUrl.pathname === '/admin-login') {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (await verifySessionToken(token) !== null) {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/admin', request.url))
      );
    }
  }

  // --- Admin Route Protection (exclude login page itself) ---
  // Sliding renewal: when a valid session has < RENEWAL_THRESHOLD_MS left,
  // mint a fresh 7-day token on the response.
  let renewedToken: string | null = null;
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin-login') {
    const secret = process.env.ADMIN_PASSWORD;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const expiresAt = secret ? await verifySessionToken(token) : null;
    // If no password is configured, or the token is missing/invalid/expired,
    // block all admin access.
    if (!secret || expiresAt === null) {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/admin-login', request.url))
      );
    }
    if (expiresAt - Date.now() < RENEWAL_THRESHOLD_MS) {
      renewedToken = await createSessionToken(Date.now() + SESSION_DURATION_MS, secret);
    }
  }

  const response = NextResponse.next();
  if (renewedToken) {
    // Cookie attributes mirror the login action (src/app/admin-login/actions.ts).
    response.cookies.set(SESSION_COOKIE_NAME, renewedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000,
    });
  }
  return addSecurityHeaders(response);
}

export const config = {
  matcher: ['/admin/:path*', '/api/contact', '/api/guidos-order', '/((?!_next/static|_next/image|favicon.ico).*)'],
}
