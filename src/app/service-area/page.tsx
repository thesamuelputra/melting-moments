import { Metadata } from 'next';
import { AREA_SERVED, JsonLd, SITE, breadcrumbList } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Service Area',
  description: 'Melting Moments serves the Greater Victoria area including Langford, Colwood, Oak Bay, Saanich, and is available up-island to Nanaimo.',
};

export const revalidate = 300;

// The eight Greater Victoria communities + Vancouver Island as an ItemList;
// mirrors the businesses' areaServed nodes emitted site-wide in layout.tsx.
const areaServedList = {
  '@type': 'ItemList',
  '@id': `${SITE.url}/service-area#areas`,
  name: `Communities served by ${SITE.name}`,
  itemListElement: AREA_SERVED.map((area, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: area,
  })),
};

export default function ServiceArea() {
  return (
    <div>
        <JsonLd data={areaServedList} />
        <JsonLd data={breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Service Area', path: '/service-area' }])} />
        <header className="container" style={{ paddingTop: "calc(80px + 3vw)", paddingBottom: "clamp(4rem, 10vw, 8rem)" }}>
            <div className="menu-index" style={{ marginBottom: "2rem" }}>Where We Serve</div>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Service Area</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>

            <div style={{ maxWidth: '760px', margin: '3rem auto 0 auto', textAlign: 'center' }}>
               <h2 className="noire-serif" style={{ marginBottom: '1.5rem' }}>Victoria &amp; Beyond</h2>
               <p style={{ fontSize: "var(--text-body)", opacity: 0.8, maxWidth: '60ch', margin: '0 auto 1.5rem auto' }}>
                   Based in Esquimalt, we cater across Greater Victoria, from intimate dinners to weddings and corporate gatherings. Wherever you are on the south Island, there&apos;s a good chance we already know the room.
               </p>
            </div>

            {/* The page eyebrow already says "Where We Serve", so this grid
                carries a distinct micro-label. */}
            <div style={{ maxWidth: '880px', margin: 'clamp(3rem, 6vw, 5rem) auto 0', textAlign: 'center' }}>
               <div className="menu-index" style={{ marginBottom: '2rem' }}>Greater Victoria</div>
               <ul
                 style={{
                   listStyle: 'none',
                   margin: '0 auto',
                   padding: 0,
                   display: 'grid',
                   gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                   gap: '1px',
                   backgroundColor: 'rgba(0,0,0,0.1)',
                   border: '1px solid rgba(0,0,0,0.1)',
                 }}
               >
                 {[
                   'Victoria',
                   'Esquimalt',
                   'Oak Bay',
                   'Saanich',
                   'Langford',
                   'Colwood',
                   'View Royal',
                   'Sidney',
                 ].map((place) => (
                   <li
                     key={place}
                     className="noire-serif"
                     style={{
                       backgroundColor: 'var(--clr-bone)',
                       padding: '2rem 1rem',
                       fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                     }}
                   >
                     {place}
                   </li>
                 ))}
               </ul>
            </div>

            {/* Notes */}
            <div
              style={{
                maxWidth: '880px',
                margin: 'clamp(3rem, 6vw, 5rem) auto 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(2rem, 4vw, 3rem)',
              }}
            >
               <div>
                 <p className="menu-index" style={{ marginBottom: '1rem' }}>Weddings &amp; Large Events</p>
                 <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '38ch' }}>
                   For weddings and larger celebrations, Chef Paul and his team travel further up-Island: the Cowichan Valley, Nanaimo and beyond. Tell us where you&apos;re headed and we&apos;ll talk it through.
                 </p>
               </div>
               <div>
                 <p className="menu-index" style={{ marginBottom: '1rem' }}>Guido&apos;s Delivery</p>
                 <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '38ch' }}>
                   Guido&apos;s Gourmet ready-made meals deliver across Victoria for a flat rate of $12.50. Pickup is also available by appointment from our Esquimalt kitchen.
                 </p>
               </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 'clamp(3rem, 6vw, 5rem)' }}>
               <div style={{ padding: '2rem', border: '1px solid var(--clr-ink)', display: 'inline-block' }}>
                 <p className="menu-index">Base Location</p>
                 <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>614 Grenville Ave, Esquimalt</p>
                 <p style={{ opacity: 0.6, marginTop: '0.25rem', fontSize: 'var(--text-micro)' }}>Victoria, British Columbia</p>
               </div>
            </div>
        </header>
    </div>
  );
}
