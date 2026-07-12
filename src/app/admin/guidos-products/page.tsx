import { promises as fs } from 'fs';
import path from 'path';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { ToastProvider } from '../_components';
import AdminGuidosProductsClient from './AdminGuidosProductsClient';

const IMAGE_EXTENSIONS = /\.(webp|jpe?g|png|avif|svg)$/i;

/** Bundled product photos available to the image picker. */
async function listGuidosImages(): Promise<string[]> {
  try {
    const dir = path.join(process.cwd(), 'public', 'guidos');
    const entries = await fs.readdir(dir);
    return entries
      .filter((file) => IMAGE_EXTENSIONS.test(file))
      .sort()
      .map((file) => `/guidos/${file}`);
  } catch {
    return []; // directory missing — the picker just shows the URL field
  }
}

export default async function GuidosProductsAdminPage() {
  const [items, libraryImages] = await Promise.all([
    fetchQuery(api.guidosProducts.list, {}),
    listGuidosImages(),
  ]);

  const products = items.map((item) => ({
    id: item._id,
    name: item.name,
    category: item.category,
    priceFrom: item.priceFrom,
    sizes: item.sizes ?? [],
    image: item.image ?? '',
    isAvailable: item.isAvailable,
    isLimitedEdition: item.isLimitedEdition,
    orderIndex: item.orderIndex,
  }));

  return (
    <ToastProvider>
      <AdminGuidosProductsClient initialProducts={products} libraryImages={libraryImages} />
    </ToastProvider>
  );
}
