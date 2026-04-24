'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [shutterActive, setShutterActive] = useState(false);
  const isNavigating = useRef(false);
  const prevPathname = useRef(pathname);

  // Intercept ALL internal link clicks BEFORE Next.js handles them
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

      // Prevent Next.js Link from navigating immediately
      // (Next.js checks e.defaultPrevented and bails out)
      e.preventDefault();
      isNavigating.current = true;

      // Step 1: Fire shutter — covers the current page
      setShutterActive(true);

      // Step 2: Navigate AFTER shutter fully covers screen (~450ms)
      // Content swaps behind the shutter while it's opaque
      setTimeout(() => {
        router.push(href);
      }, 450);

      // Step 3: Clean up after full shutter sequence completes
      setTimeout(() => {
        setShutterActive(false);
        isNavigating.current = false;
      }, 1300);
    };

    // Capture phase fires BEFORE React's synthetic event handlers
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
      {/* Shutter overlay — closes first, then opens to reveal new page */}
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
