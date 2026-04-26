import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminSettingsClient, { SettingsMap } from './AdminSettingsClient';

export default async function SettingsPage() {
  const settingsMap = await fetchQuery(api.businessSettings.getAll);

  return <AdminSettingsClient initialSettings={settingsMap as unknown as SettingsMap} />;
}
