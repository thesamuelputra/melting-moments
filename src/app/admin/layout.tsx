import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminLayoutClient from './AdminLayoutClient';
import ConvexClientProvider from '../ConvexClientProvider';
import './admin.css';
import { unstable_noStore } from 'next/cache';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Don't cache — banner status must be live
  unstable_noStore();
  const settings = await fetchQuery(api.businessSettings.getAll);
  const bannerEnabled = settings['banner_enabled'] === 'true' && !!settings['banner_text'];

  return (
    <ConvexClientProvider>
      <AdminLayoutClient bannerEnabled={bannerEnabled}>
        {children}
      </AdminLayoutClient>
    </ConvexClientProvider>
  );
}
