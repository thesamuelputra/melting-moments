import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { ToastProvider } from '../_components';
import AdminSettingsClient from './AdminSettingsClient';

export default async function SettingsPage() {
  const settingsMap = await fetchQuery(api.businessSettings.getAll);

  return (
    <ToastProvider>
      <AdminSettingsClient initialSettings={settingsMap} />
    </ToastProvider>
  );
}
