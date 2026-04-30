'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { revalidatePath } from 'next/cache';
import { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin } from '@/lib/auth';

export async function getUploadUrl() {
  await requireAdmin();
  return await fetchMutation(api.files.generateUploadUrl, {
    adminSecret: process.env.ADMIN_PASSWORD!,
  });
}

export async function saveUploadedImage(data: {
  storageId: string;
  title: string;
  alt: string;
  section?: string;
}) {
  await requireAdmin();
  if (!data.title) throw new Error('Title is required');

  await fetchMutation(api.files.saveImage, {
    adminSecret: process.env.ADMIN_PASSWORD!,
    storageId: data.storageId as Id<"_storage">,
    title: data.title,
    alt: data.alt || data.title,
    section: data.section || undefined,
  });

  await fetchMutation(api.activityLog.log, {
    adminSecret: process.env.ADMIN_PASSWORD!,
    action: `Uploaded image: ${data.title}`,
    section: 'Media',
    details: data.section || 'general',
  });

  revalidatePath('/admin/media');
  revalidatePath('/gallery');
}

export async function updateImage(id: string, data: {
  title?: string;
  alt?: string;
  section?: string;
  orderIndex?: number;
}) {
  await requireAdmin();
  await fetchMutation(api.files.update, {
    adminSecret: process.env.ADMIN_PASSWORD!,
    id: id as Id<"siteImages">,
    title: data.title,
    alt: data.alt,
    section: data.section,
    orderIndex: data.orderIndex,
  });

  await fetchMutation(api.activityLog.log, {
    adminSecret: process.env.ADMIN_PASSWORD!,
    action: `Updated image metadata: ${data.title || 'unnamed'}`,
    section: 'Media',
  });

  revalidatePath('/admin/media');
  revalidatePath('/gallery');
}

export async function deleteImage(id: string) {
  await requireAdmin();

  await fetchMutation(api.files.remove, {
    adminSecret: process.env.ADMIN_PASSWORD!,
    id: id as Id<"siteImages">,
  });

  await fetchMutation(api.activityLog.log, {
    adminSecret: process.env.ADMIN_PASSWORD!,
    action: 'Deleted image',
    section: 'Media',
  });

  revalidatePath('/admin/media');
  revalidatePath('/gallery');
  return { success: true };
}
