import MenuCourses from '@/components/guidos/MenuCourses';
import { toCourses, type ProductLike } from '@/components/guidos/menu-data';
import { getGuidosProducts } from '@/lib/cms';
import { GUIDOS_DELIVERY_FEE, SITE } from '@/lib/seo';
import { GUIDOS_FALLBACK_PRODUCTS } from '@/lib/guidos-fallback-products';
import OrderForm from './OrderForm';

export default async function GuidosOrderPage() {
  const items = await getGuidosProducts().catch(() => []);
  const products: ProductLike[] = items.length > 0 ? items : GUIDOS_FALLBACK_PRODUCTS;
  const courses = toCourses(products);

  return (
    <>
      <header className="gg-wrap gg-pagehead">
        <h1 className="gg-display">Request an order</h1>
        <p className="gg-lede">
          Tell us what you would like. This is a request, not a payment. Chef Paul replies within 24 hours to confirm your items, your total and a time for delivery or pickup.
        </p>
      </header>

      <div className="gg-wrap gg-order">
        <OrderForm menuReference={<MenuCourses courses={courses} variant="reference" headingLevel="h2" />} />

        <aside className="gg-aside" aria-labelledby="gg-how-title">
          <h2 id="gg-how-title">How it works</h2>
          <ol className="gg-steps">
            <li>
              <strong>Send your request</strong>
              <span>List the dishes, sizes and how many.</span>
            </li>
            <li>
              <strong>Paul replies within 24 hours</strong>
              <span>He confirms your items and your total.</span>
            </li>
            <li>
              <strong>Delivery or pickup</strong>
              <span>Delivery anywhere in Victoria for a flat {GUIDOS_DELIVERY_FEE}, or pickup by appointment at {SITE.addressShort}.</span>
            </li>
          </ol>
          <p className="gg-call">
            Prefer to talk it through? Call <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
          </p>
        </aside>
      </div>
    </>
  );
}
