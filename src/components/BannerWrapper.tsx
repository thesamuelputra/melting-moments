'use client';

import AnnouncementBanner from './AnnouncementBanner';
import { usePathname } from 'next/navigation';

export type BannerData = {
  enabled: boolean;
  text: string;
  link: string;
  style: 'dark' | 'accent' | 'light';
  showOn: string;
};

// Banner content arrives as props from the server layout (cached Convex read)
// — this component only handles the client-side path targeting.
export default function BannerWrapper({ data }: { data: BannerData }) {
  const pathname = usePathname();

  if (!data.enabled || !data.text) return null;

  // Apply targeting logic
  if (data.showOn !== 'all') {
    if (data.showOn === 'home' && pathname !== '/') return null;
    if (data.showOn !== 'home' && !pathname.startsWith(`/${data.showOn}`)) return null;
  }

  return <AnnouncementBanner data={data} />;
}
