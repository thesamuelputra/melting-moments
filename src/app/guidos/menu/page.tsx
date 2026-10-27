import fs from 'fs';
import path from 'path';
import MenuCourses from '@/components/guidos/MenuCourses';
import { toCourses, type ProductLike } from '@/components/guidos/menu-data';
import { getGuidosProducts } from '@/lib/cms';
import { GUIDOS_FALLBACK_PRODUCTS } from '@/lib/guidos-fallback-products';
import { JsonLd, SITE, breadcrumbList, productNodes } from '@/lib/seo';

export const revalidate = 300;

const breadcrumbs = breadcrumbList([
  { name: 'Home', path: '/' },
  { name: "Guido's Gourmet", path: '/guidos' },
  { name: 'Menu', path: '/guidos/menu' },
]);

// A photo shows only once its file exists, so a dish without one is simply
// set in type. Hosted (https) photos from the admin pass through untouched.
const resolveImage = (image: string | undefined) => {
  if (!image || image.endsWith('.svg')) return undefined;
  if (image.startsWith('http')) return image;
  return fs.existsSync(path.join(process.cwd(), 'public', image)) ? image : undefined;
};

export default async function GuidosMenuPage() {
  const items = await getGuidosProducts().catch(() => []);
  const fromCms = items.length > 0;
  const products: ProductLike[] = fromCms ? items : GUIDOS_FALLBACK_PRODUCTS;
  const courses = toCourses(products, resolveImage);

  // Product structured data from the same CMS records. Images become
  // absolute URLs; the built-in menu has no photos, so it carries none.
  const productInputs = items.map((item) => ({
    name: item.name,
    category: item.category,
    priceFrom: item.priceFrom,
    sizes: item.sizes,
    isAvailable: item.isAvailable,
    image: item.image ? (item.image.startsWith('http') ? item.image : `${SITE.url}${item.image}`) : undefined,
  }));

  return (
    <>
      {fromCms && <JsonLd data={productNodes(productInputs)} />}
      <JsonLd data={breadcrumbs} />

      <header className="gg-wrap gg-pagehead">
        <h1 className="gg-display">The menu</h1>
        <p className="gg-lede">
          Homemade Italian meals, ready to heat and serve. Every size and price is below; Paul confirms your total when he replies to your order.
        </p>
        {courses.length > 1 && (
          <nav className="gg-jump" aria-label="Courses">
            <ul>
              {courses.map((c) => (
                <li key={c.id}><a href={`#${c.id}`}>{c.title}</a></li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <div className="gg-wrap gg-menu-page">
        <MenuCourses courses={courses} variant="full" headingLevel="h2" />
      </div>
    </>
  );
}
