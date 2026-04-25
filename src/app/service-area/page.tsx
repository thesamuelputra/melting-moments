import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Service Area | Melting Moments Catering Victoria BC',
  description: 'Melting Moments serves the Greater Victoria area including Langford, Colwood, Oak Bay, Saanich, and is available up-island to Nanaimo and Tofino.',
};

export default function ServiceArea() {
  return (
    <div>
        <header className="container" style={{ paddingTop: "clamp(8rem, 15vw, 12rem)", paddingBottom: "clamp(4rem, 10vw, 8rem)" }}>
            <div className="menu-index" style={{ marginBottom: "2rem" }}>Information</div>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Service Area</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>
            
            <div style={{ maxWidth: '800px', margin: '4rem auto 0 auto', textAlign: 'center' }}>
               <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>Victoria & Beyond</h2>
               <p style={{ fontSize: "var(--text-body)", opacity: 0.8, marginBottom: '2rem' }}>
                   Melting Moments proudly serves the Greater Victoria Area, including Langford, Colwood, Oak Bay, Saanich, and Esquimalt. 
                   For specialized elite events, Chef Paul and his team are available for travel up-island to Nanaimo, the Cowichan Valley, and Tofino upon request.
               </p>
               <div style={{ padding: '2rem', border: '1px solid var(--clr-ink)', display: 'inline-block', marginTop: '2rem' }}>
                 <p className="menu-index">Base Location</p>
                 <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>Victoria, British Columbia</p>
               </div>
            </div>
        </header>
    </div>
  );
}
