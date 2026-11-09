'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Scroll to the section the address's hash names, now and once more when the
 * web fonts have swapped in: the serif stands taller than its fallback, so
 * everything below the heading moves down by a line or two after the first
 * scroll. Returns false when there is no hash or no such section.
 */
function landOnHash(): boolean {
  const hash = window.location.hash.slice(1);
  if (!hash) return false;
  const target = document.getElementById(decodeURIComponent(hash));
  if (!target) return false;
  target.scrollIntoView({ behavior: 'auto', block: 'start' });
  document.fonts.ready.then(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }));
  return true;
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [shutterActive, setShutterActive] = useState(false);
  const isNavigating = useRef(false);
  const prevPathname = useRef(pathname);
  const cameFromHistory = useRef(false);

  // history.scrollRestoration is 'auto', so the browser puts a back/forward
  // navigation back where the visitor left it. Note which navigations are
  // pops so the jump-to-top below does not race that.
  useEffect(() => {
    const notePop = () => { cameFromHistory.current = true; };
    window.addEventListener('popstate', notePop);
    return () => window.removeEventListener('popstate', notePop);
  }, []);

  // A page opened straight at a hash address lands on its section before the
  // fonts arrive, so land it again once they have
  useEffect(() => {
    landOnHash();
  }, []);

  // Intercept internal link clicks before Next.js handles them
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/')) return;

      // Let modifier-key clicks pass through (open in new tab etc)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      if (isNavigating.current) return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // A link to a spot on the page the visitor is already reading is a
      // scroll, not a journey: glide there and leave the shutter closed. A
      // plain link to the current page does nothing at all.
      const [hrefPath, hrefHash = ''] = href.split('#');
      if (hrefPath === pathname) {
        if (!hrefHash) return;
        const target = document.getElementById(decodeURIComponent(hrefHash));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', `#${hrefHash}`);
        return;
      }

      // A followed link is a fresh push, wherever the visitor has been before.
      // Cleared here rather than below, because the reduced-motion path returns
      // early and still navigates.
      cameFromHistory.current = false;

      // Respect reduced motion: skip the shutter entirely and let Next.js
      // navigate instantly (no preventDefault, no artificial delay).
      if (reducedMotion) return;

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

  // A new page starts at the top, or at the section its link named with a
  // hash. Going back does neither: that lands the visitor where they were,
  // which is the whole point of going back, so leave the browser's own
  // restoration alone rather than fighting it to zero.
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      const wasPop = cameFromHistory.current;
      cameFromHistory.current = false;
      if (wasPop) return;
      if (!landOnHash()) window.scrollTo(0, 0);
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
