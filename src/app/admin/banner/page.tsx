import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { ToastProvider } from '../_components';
import AdminBannerClient, { type BannerFormData } from './AdminBannerClient';
import { isBannerShowOn, isBannerStyle } from './validation';

export default async function AdminBannerPage() {
  const settings = await fetchQuery(api.businessSettings.getAll);
  const rawStyle = settings['banner_style'] || 'dark';
  const rawShowOn = settings['banner_show_on'] || 'all';
  const initial: BannerFormData = {
    enabled: settings['banner_enabled'] === 'true',
    text: settings['banner_text'] || '',
    link: settings['banner_link'] || '',
    // Normalize unexpected stored values so the editor never renders an
    // unknown style/targeting state.
    style: isBannerStyle(rawStyle) ? rawStyle : 'dark',
    showOn: isBannerShowOn(rawShowOn) ? rawShowOn : 'all',
  };
  return (
    <ToastProvider>
      <AdminBannerClient initial={initial} />
    </ToastProvider>
  );
}
