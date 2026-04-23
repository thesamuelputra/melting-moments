'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [transitioning, setTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [prevPathname, setPrevPathname] = useState(pathname);

  const runEntrance = useCallback(() => {
    // Scroll to top on new page
    window.scrollTo(0, 0);
    setDisplayChildren(children);
    // Small delay to let DOM paint
    requestAnimationFrame(() => {
      setTransitioning(false);
    });
  }, [children]);

  useEffect(() => {
    if (pathname !== prevPathname) {
      // Route changed — play exit shutter
      setTransitioning(true);
      setPrevPathname(pathname);

      // Wait for shutter to fully cover screen, then swap content
      const timer = setTimeout(() => {
        runEntrance();
      }, 600); // matches CSS shutter animation duration

      return () => clearTimeout(timer);
    } else {
      // Same route or initial render — just show children
      setDisplayChildren(children);
    }
  }, [pathname, children, prevPathname, runEntrance]);

  return (
    <>
      {/* Shutter overlay */}
      <div className={`page-shutter ${transitioning ? 'page-shutter--active' : ''}`} aria-hidden="true">
        <div className="page-shutter__panel page-shutter__panel--1" />
        <div className="page-shutter__panel page-shutter__panel--2" />
        <div className="page-shutter__panel page-shutter__panel--3" />
      </div>

      {/* Page content with fade-in */}
      <div className={`page-content ${transitioning ? 'page-content--exit' : 'page-content--enter'}`}>
        {displayChildren}
      </div>
    </>
  );
}
