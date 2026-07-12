import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { ToastProvider } from '../_components';
import AdminContentClient from './AdminContentClient';

export default async function ContentPage() {
  const settingsMap = await fetchQuery(api.businessSettings.getAll);
  return (
    <ToastProvider>
      <AdminContentClient initialContent={settingsMap} />
    </ToastProvider>
  );
}
