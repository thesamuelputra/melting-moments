import db from '@/lib/db';
import AdminSettingsClient, { SettingsMap } from './AdminSettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settingsData = await db.businessSetting.findMany();
  
  // Convert array of {key, value} to a flat object
  const settingsMap: Record<string, string> = {};
  settingsData.forEach((setting: { key: string; value: string }) => {
    settingsMap[setting.key] = setting.value;
  });

  return <AdminSettingsClient initialSettings={settingsMap as unknown as SettingsMap} />;
}
