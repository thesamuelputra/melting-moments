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
//
// Targeting semantics:
//   'all'      → every public page
//   'catering' → every page EXCEPT the Guido's section
//   'guidos'   → the Guido's section (/guidos and below) only
//   'home'     → the homepage ('/') only
// The banner is never shown on the admin surface (/admin*, /admin-login).
export default function BannerWrapper({ data }: { data: BannerData }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;
  if (!data.enabled || !data.text) return null;

  const isGuidos = pathname === '/guidos' || pathname.startsWith('/guidos/');
  if (data.showOn === 'catering' && isGuidos) return null;
  if (data.showOn === 'guidos' && !isGuidos) return null;
  if (data.showOn === 'home' && pathname !== '/') return null;
  // 'all' (or any unknown stored value) → show everywhere

  return <AnnouncementBanner data={data} />;
}
