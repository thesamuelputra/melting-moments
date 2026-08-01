'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type BannerData = {
  enabled: boolean;
  text: string;
  link: string;
  style: 'dark' | 'accent' | 'light';
};

export default function AnnouncementBanner({ data }: { data: BannerData }) {
  const [dismissed, setDismissed] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const isGuidosPage = usePathname().startsWith('/guidos');

  useEffect(() => {
    // Respect session dismissal
    const key = `banner-dismissed-${data.text.slice(0, 20)}`;
    if (sessionStorage.getItem(key)) setDismissed(true);
  }, [data.text]);

  useEffect(() => {
    // Tell the nav and the sticky rails how tall the banner is via a CSS
    // custom property. Observed rather than measured once: the message wraps
    // to a different number of lines on rotation and on narrow phones, and it
    // reflows again when the webfont swaps in, and everything below is pinned
    // to this number.
    if (!ref || dismissed) {
      document.documentElement.style.setProperty('--banner-height', '0px');
      return;
    }
    const publish = () => {
      const height = ref.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--banner-height', `${height}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(ref);
    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, [ref, dismissed]);

  if (!data.enabled || dismissed) return null;

  const bgMap = {
    dark: { bg: 'var(--clr-ink)', color: 'var(--clr-oat)' },
    // Navy ground and light gold have no equivalent palette token, so they stay
    // as literals to keep the accent banner visually identical.
    accent: { bg: '#1a1a2e', color: '#E2C992' },
    // The light style is the one that borrows the page's own paper, so it
    // follows the section the visitor is in the way the nav and footer do.
    light: isGuidosPage
      ? { bg: 'var(--g-cream)', color: 'var(--g-ink)' }
      : { bg: 'var(--clr-bone)', color: 'var(--clr-ink)' },
  };
  const { bg, color } = bgMap[data.style] || bgMap.dark;

  const handleDismiss = () => {
    const key = `banner-dismissed-${data.text.slice(0, 20)}`;
    sessionStorage.setItem(key, '1');
    setDismissed(true);
  };

  const content = (
    <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
      {data.text}
      {data.link && <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>→</span>}
    </span>
  );

  return (
    <div
      ref={setRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10005,
        backgroundColor: bg,
        color,
        padding: '0.6rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        minHeight: '36px',
      }}
    >
      {data.link ? (
        <Link href={data.link} style={{ color, textDecoration: 'none' }}>{content}</Link>
      ) : (
        <div>{content}</div>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color, opacity: 0.5, fontSize: '1rem', lineHeight: 1, padding: '0.75rem 1rem', transition: 'opacity 0.2s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
      >
        ✕
      </button>
    </div>
  );
}
