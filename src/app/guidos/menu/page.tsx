import { getGuidosProducts } from '@/lib/cms';
import { JsonLd, SITE, breadcrumbList, productNodes } from '@/lib/seo';
import GuidosMenuClient from './GuidosMenuClient';

export const revalidate = 300;

const breadcrumbs = breadcrumbList([
  { name: 'Home', path: '/' },
  { name: "Guido's Gourmet", path: '/guidos' },
  { name: 'Menu', path: '/guidos/menu' },
]);

export default async function GuidosMenuPage() {
  const items = await getGuidosProducts().catch(() => []);

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
    return (
      <>
        <JsonLd data={breadcrumbs} />
        <GuidosMenuFallback />
      </>
    );
  }

  // Product JSON-LD from the same server-fetched docs. Images become absolute
  // URLs; the placeholder SVG carries no information, so it is omitted.
  const productInputs = items.map((item) => ({
    name: item.name,
    category: item.category,
    priceFrom: item.priceFrom,
    sizes: item.sizes,
    isAvailable: item.isAvailable,
    image: item.image
      ? item.image.startsWith('http')
        ? item.image
        : `${SITE.url}${item.image}`
      : undefined,
  }));

  return (
    <>
      <JsonLd data={productNodes(productInputs)} />
      <JsonLd data={breadcrumbs} />
      <GuidosMenuClient products={products} />
    </>
  );
}
