import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Melting Moments & Guido\'s Gourmet',
  description: 'Terms of service for catering bookings and ready-made meal orders with Melting Moments and Guido\'s Gourmet in Victoria, BC.',
};

export default function Terms() {
  return (
    <div>
        <header className="container" style={{ paddingTop: "clamp(8rem, 15vw, 12rem)", paddingBottom: "clamp(4rem, 10vw, 8rem)" }}>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Terms of Service</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>
            
            <div style={{ maxWidth: '800px', margin: '4rem auto 0 auto' }}>
               <div className="menu-index" style={{ marginBottom: '1.5rem', fontSize: 'var(--text-micro)' }}>Catering Services</div>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   By requesting a quote or booking an event with Melting Moments, you agree to our standard catering terms. A deposit is required to secure your date, with full payment expected prior to the event unless formal corporate billing arrangements have been made.
               </p>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   Menu subject to change based on seasonal availability. Final guest counts must be provided 14 days before the event. Cancellations must be made in writing; deposits are non-refundable within 30 days of the event date.
               </p>

               <div className="menu-index" style={{ marginBottom: '1.5rem', marginTop: '3rem', fontSize: 'var(--text-micro)' }}>Ready-Made Meals (Guido&apos;s Gourmet)</div>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   All ready-made meals are prepared fresh by Chef Paul Silletta. Orders are confirmed via email within 24 hours of submission. Payment is collected upon delivery or pickup.
               </p>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   Meals are perishable goods. Once delivered, returns or refunds cannot be issued. Please consume within the recommended timeframe provided with your order. If you have food allergies, it is your responsibility to communicate these clearly when placing your order.
               </p>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   Delivery is available in the Greater Victoria area for a flat fee of $12.50. Delivery times are approximate and subject to scheduling. Pickup is available by appointment at 614 Grenville Ave, Esquimalt.
               </p>

               <div className="menu-index" style={{ marginBottom: '1.5rem', marginTop: '3rem', fontSize: 'var(--text-micro)' }}>General</div>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   All content, imagery, and branding on this website are the property of Chef Paul Silletta and may not be reproduced without permission. Prices are subject to change without notice.
               </p>
               <p style={{ opacity: 0.4, fontSize: 'var(--text-micro)', marginTop: '4rem' }}>
                   Last updated: April 2026
               </p>
            </div>
        </header>
    </div>
  );
}
