import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminMediaClient from './AdminMediaClient';

export default async function AdminMediaPage() {
  const images = await fetchQuery(api.files.list, {});

  const serialized = images.map((img) => ({
    id: img._id as string,
    storageId: img.storageId as string,
    title: img.title,
    alt: img.alt,
    section: img.section ?? '',
    orderIndex: img.orderIndex,
    uploadedAt: img.uploadedAt,
    url: img.url ?? '',
  }));

  return <AdminMediaClient initialImages={serialized} />;
}
