import Link from 'next/link';
import GuidosWordmark from './GuidosWordmark';
import { GUIDOS_DELIVERY_FEE, SITE } from '@/lib/seo';

/**
 * The footer on Guido's pages: one deep green plane. It opens with the
 * Italian line, says plainly how ordering works, then the links. The line
 * appears here once on every page instead of being scattered as decoration.
 * The order page already walks through each step beside its form, so there
 * the band keeps only the line.
 */
export default function GuidosFooter({ pathname, year }: { pathname: string; year: number }) {
  const onOrderPage = pathname === '/guidos/order';
  return (
    <footer className="gg-footer">
      <div className="gg-wrap">
        <div className="gg-footer-band">
          <p className="gg-footer-line" lang="it">Quando la fame parla, parla Italiano!</p>
          {!onOrderPage && (
            <div>
              <h2>How to order</h2>
              <dl className="gg-facts">
                <div>
                  <dt>Delivery</dt>
                  <dd>{GUIDOS_DELIVERY_FEE} flat, anywhere in Victoria.</dd>
                </div>
                <div>
                  <dt>Pickup</dt>
                  <dd>By appointment at {SITE.addressShort}.</dd>
                </div>
                <div>
                  <dt>Ordering</dt>
                  <dd>Send a request and Paul replies within 24 hours to confirm your items and total. No online payment.</dd>
                </div>
              </dl>
              <Link className="gg-btn gg-btn--light" href="/guidos/order">Request an order</Link>
            </div>
          )}
        </div>

        <div className="gg-footer-grid">
          <div className="gg-footer-brand">
            <GuidosWordmark tone="cream" showCrest={false} wordSize="34px" style={{ alignItems: 'flex-start' }} />
            <p>Homemade Italian meals from Chef Paul Silletta&rsquo;s kitchen in Esquimalt, since 2009.</p>
          </div>
          <div>
            <h2>Guido&rsquo;s Gourmet</h2>
            <ul>
              <li><Link href="/guidos">Overview</Link></li>
              <li><Link href="/guidos/menu">Menu</Link></li>
              <li><Link href="/guidos#stockists">Where to buy</Link></li>
              <li><Link href="/guidos/order">Request an order</Link></li>
            </ul>
          </div>
          <div>
            <h2>Melting Moments</h2>
            <ul>
              <li><Link href="/catering">Catering</Link></li>
              <li><Link href="/weddings">Weddings</Link></li>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/chef-paul">Chef Paul</Link></li>
              <li><Link href="/about">About us</Link></li>
            </ul>
          </div>
          <div className="gg-footer-visit">
            <h2>The kitchen</h2>
            <address>
              <ul>
                <li>{SITE.addressDisplay}</li>
                <li>Pickup by appointment</li>
                <li><a href={SITE.phoneHref}>{SITE.phoneDisplay}</a></li>
                <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              </ul>
            </address>
          </div>
        </div>

        <div className="gg-footer-base">
          <p>&copy; {year} Chef Paul Silletta</p>
          <ul>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
