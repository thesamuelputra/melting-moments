import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminContentClient from './AdminContentClient';

export default async function ContentPage() {
  const settingsMap = await fetchQuery(api.businessSettings.getAll);
  return <AdminContentClient initialContent={settingsMap} />;
}
