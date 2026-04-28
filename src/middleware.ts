import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function getExpectedToken(): Promise<string | null> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null; // No password configured — block all access

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode('melting-moments-admin-session');
  
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');
}

// ---------- Contact API Rate Limiter ----------
// Sliding window: max 10 requests per minute per IP
const contactRateMap = new Map<string, number[]>();
const CONTACT_RATE_LIMIT = 10;
const CONTACT_WINDOW_MS = 60_000;

function isContactRateLimited(ip: string): boolean {
  const now = Date.now();
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
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP: allow self, inline styles (needed for Next.js), and common CDNs
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js requires these
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.resend.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export async function middleware(request: NextRequest) {
  // --- Contact API Rate Limiting ---
  if (request.nextUrl.pathname === '/api/contact' && request.method === 'POST') {
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

  // --- Admin Route Protection ---
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const expected = await getExpectedToken();
    // If no password is configured, block all admin access
    if (!expected) {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/admin-login', request.url))
      );
    }
    const token = request.cookies.get('admin_token')?.value;
    if (!token || token !== expected) {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/admin-login', request.url))
      );
    }
  }
  
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: ['/admin/:path*', '/api/contact', '/((?!_next/static|_next/image|favicon.ico).*)'],
}
