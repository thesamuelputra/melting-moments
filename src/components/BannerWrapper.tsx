import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AnnouncementBanner from './AnnouncementBanner';

export default async function BannerWrapper() {
  const settings = await fetchQuery(api.businessSettings.getAll);

  const data = {
    enabled: settings['banner_enabled'] === 'true',
    text: settings['banner_text'] || '',
    link: settings['banner_link'] || '',
    style: (settings['banner_style'] || 'dark') as 'dark' | 'accent' | 'light',
  };

  if (!data.enabled || !data.text) return null;

  return <AnnouncementBanner data={data} />;
}
