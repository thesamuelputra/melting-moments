import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import GuidosMenuClient from './GuidosMenuClient';

export default async function GuidosMenuPage() {
  const items = await fetchQuery(api.guidosProducts.list);

  const products = items.map((item) => ({
    id: item._id,
    name: item.name,
    category: item.category,
    priceFrom: item.priceFrom,
    sizes: item.sizes ?? [],
    image: item.image ?? '/guidos/placeholder.svg',
    isAvailable: item.isAvailable,
    isLimitedEdition: item.isLimitedEdition,
  }));

  // If no CMS data yet, show the hardcoded fallback
  if (products.length === 0) {
    const { default: GuidosMenuFallback } = await import('./GuidosMenuFallback');
    return <GuidosMenuFallback />;
  }

  return <GuidosMenuClient products={products} />;
}
