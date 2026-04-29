import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminGuidosProductsClient from './AdminGuidosProductsClient';

export default async function GuidosProductsAdminPage() {
  const items = await fetchQuery(api.guidosProducts.list);

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

  return <AdminGuidosProductsClient initialProducts={products} />;
}
