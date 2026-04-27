'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type BannerData = {
  enabled: boolean;
  text: string;
  link: string;
  style: 'dark' | 'accent' | 'light';
};

export default function AnnouncementBanner({ data }: { data: BannerData }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Respect session dismissal
    const key = `banner-dismissed-${data.text.slice(0, 20)}`;
    if (sessionStorage.getItem(key)) setDismissed(true);
  }, [data.text]);

  if (!data.enabled || dismissed) return null;

  const bgMap = {
    dark: { bg: 'var(--clr-ink)', color: 'var(--clr-oat)' },
    accent: { bg: '#1a1a2e', color: '#E2C992' },
    light: { bg: '#F5F0E8', color: 'var(--clr-ink)' },
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
        style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color, opacity: 0.5, fontSize: '1rem', lineHeight: 1, padding: '0.25rem 0.5rem' }}
      >
        ✕
      </button>
    </div>
  );
}
