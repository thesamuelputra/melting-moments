import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminLayoutClient from './AdminLayoutClient';
import ConvexClientProvider from '../ConvexClientProvider';
import './admin.css';
import { connection } from 'next/server';
import { requireAdminOrRedirect } from '@/lib/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Don't cache: banner status must be live. connection() replaces the
  // legacy unstable_noStore in this Next version.
  await connection();
  // Defense in depth over the proxy middleware: re-verify the session cookie
  // on every admin render; bounce to login on failure.
  await requireAdminOrRedirect();
  // A Convex outage must not take down the whole admin shell; fall back to
  // banner-off defaults and let each page's own fetch surface its error.
  let settings: Record<string, string> = {};
  try {
    settings = await fetchQuery(api.businessSettings.getAll);
  } catch (error) {
    console.error('Failed to load business settings for the admin shell:', error);
  }
  const bannerEnabled = settings['banner_enabled'] === 'true' && !!settings['banner_text'];
  const displayName = settings['owner'] || settings['name'] || 'Admin';

  return (
    <ConvexClientProvider>
      <AdminLayoutClient bannerEnabled={bannerEnabled} displayName={displayName}>
        {children}
      </AdminLayoutClient>
    </ConvexClientProvider>
  );
}
