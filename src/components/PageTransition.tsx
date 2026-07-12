'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [shutterActive, setShutterActive] = useState(false);
  const isNavigating = useRef(false);
  const prevPathname = useRef(pathname);

  // Intercept internal link clicks before Next.js handles them
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/')) return;

      // Let modifier-key clicks pass through (open in new tab etc)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Skip if same page or mid-transition
      if (href === pathname || isNavigating.current) return;

      // Respect reduced motion: skip the shutter entirely and let Next.js
      // navigate instantly (no preventDefault, no artificial delay).
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Prevent Next.js Link from navigating immediately
      // (Next.js checks e.defaultPrevented and bails out)
      e.preventDefault();
      isNavigating.current = true;

      // Step 1: Fire the shutter to cover the current page
      setShutterActive(true);

      // Step 2: Navigate once the shutter is mostly covering (fully at 500ms)
      // Content swaps behind the shutter while it's opaque
      setTimeout(() => {
        router.push(href);
      }, 300);

      // Step 3: Clean up only after the reveal fully completes. The last
      // panel finishes at ~1.2s (see .page-shutter--active in globals.css);
      // removing the class earlier snaps the panels mid-animation.
      setTimeout(() => {
        setShutterActive(false);
        isNavigating.current = false;
      }, 1250);
    };

    // Capture phase fires before React's synthetic event handlers
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, router]);

  // Scroll to top when route changes
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <>
      {/* Shutter overlay: closes first, then opens to reveal the new page */}
      <div
        className={`page-shutter ${shutterActive ? 'page-shutter--active' : ''}`}
        aria-hidden="true"
      >
        <div className="page-shutter__panel page-shutter__panel--1" />
        <div className="page-shutter__panel page-shutter__panel--2" />
        <div className="page-shutter__panel page-shutter__panel--3" />
      </div>

      {/* key={pathname} forces remount → replays entrance animation */}
      <div key={pathname} className="page-content page-content--enter">
        {children}
      </div>
    </>
  );
}
