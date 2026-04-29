import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminBannerClient from './AdminBannerClient';

export default async function AdminBannerPage() {
  const settings = await fetchQuery(api.businessSettings.getAll);
  const initial = {
    enabled: settings['banner_enabled'] === 'true',
    text: settings['banner_text'] || '',
    link: settings['banner_link'] || '',
    style: (settings['banner_style'] || 'dark') as 'dark' | 'accent' | 'light',
    showOn: (settings['banner_show_on'] || 'all') as 'all' | 'catering' | 'guidos',
  };
  return <AdminBannerClient initial={initial} />;
}
