'use client';

import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import AnnouncementBanner from './AnnouncementBanner';
import { usePathname } from 'next/navigation';

export default function BannerWrapper() {
  const pathname = usePathname();
  const settings = useQuery(api.businessSettings.getAll);

  if (settings === undefined) return null; // Loading state

  const data = {
    enabled: settings['banner_enabled'] === 'true',
    text: settings['banner_text'] || '',
    link: settings['banner_link'] || '',
    style: (settings['banner_style'] || 'dark') as 'dark' | 'accent' | 'light',
    showOn: settings['banner_show_on'] || 'all',
  };

  if (!data.enabled || !data.text) return null;

  // Apply targeting logic
  if (data.showOn !== 'all') {
    if (data.showOn === 'home' && pathname !== '/') return null;
    if (data.showOn !== 'home' && !pathname.startsWith(`/${data.showOn}`)) return null;
  }

  return <AnnouncementBanner data={data} />;
}
