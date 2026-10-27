'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GuidosWordmark from './GuidosWordmark';

/**
 * Guido's own bar under the slim site bar: the wordmark home, the menu,
 * where to buy, and one way to order. Sticky on wider screens; on a phone it
 * sits at the top of the page and scrolls away.
 */
export default function GuidosBar() {
  const pathname = usePathname();
  const current = (href: string) => (pathname === href ? 'page' : undefined);
  return (
    <div className="gg-bar">
      <div className="gg-wrap gg-bar-inner">
        <Link href="/guidos" className="gg-bar-name" aria-label="Guido's Gourmet home" aria-current={current('/guidos')}>
          <GuidosWordmark showCrest={false} wordSize="clamp(21px, 1.4rem + 0.3vw, 25px)" />
        </Link>
        <nav className="gg-bar-nav" aria-label="Guido's Gourmet">
          <ul className="gg-bar-links">
            <li><Link href="/guidos/menu" aria-current={current('/guidos/menu')}>Menu</Link></li>
            <li><Link href="/guidos#stockists">Where to buy</Link></li>
          </ul>
        </nav>
        <Link href="/guidos/order" className="gg-btn gg-btn--small gg-bar-cta" aria-current={current('/guidos/order')}>
          Request an order
        </Link>
      </div>
    </div>
  );
}
