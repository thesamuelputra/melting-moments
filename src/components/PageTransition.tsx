'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [shutterActive, setShutterActive] = useState(false);
  const prevPathname = useRef(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the very first render (initial page load — handled by Preloader)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;

      // Scroll to top immediately
      window.scrollTo(0, 0);

      // Fire shutter animation
      setShutterActive(true);

      // Remove shutter after animation completes (total ~900ms)
      const timer = setTimeout(() => {
        setShutterActive(false);
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <>
      {/* Shutter overlay — purely visual, doesn't block content */}
      <div
        className={`page-shutter ${shutterActive ? 'page-shutter--active' : ''}`}
        aria-hidden="true"
      >
        <div className="page-shutter__panel page-shutter__panel--1" />
        <div className="page-shutter__panel page-shutter__panel--2" />
        <div className="page-shutter__panel page-shutter__panel--3" />
      </div>

      {/* Content always renders directly from Next.js — no buffering */}
      <div key={pathname} className="page-content page-content--enter">
        {children}
      </div>
    </>
  );
}
