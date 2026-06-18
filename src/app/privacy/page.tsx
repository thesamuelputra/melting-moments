import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Melting Moments & Guido\'s Gourmet',
  description: 'How Melting Moments Catering and Guido\'s Gourmet handle your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div>
        <header className="container" style={{ paddingTop: "clamp(8rem, 15vw, 12rem)", paddingBottom: "clamp(4rem, 10vw, 8rem)" }}>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Privacy Policy</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>
            
            <div style={{ maxWidth: '700px', margin: '4rem auto 0 auto' }}>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   At Melting Moments Catering and Guido&apos;s Gourmet, we respect your privacy. Any personal information provided through our contact and order forms (including name, email, phone number, and event or order details) is used strictly for the purpose of communicating with you regarding your inquiry or order.
               </p>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   When you place an order through Guido&apos;s Gourmet, we collect delivery addresses solely for the purpose of fulfilling your order. This information is stored securely and is not shared with third parties except as required for delivery.
               </p>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   We do not sell or rent your personal information. To run this website and respond to you, we rely on a few trusted service providers who process data on our behalf: Convex (secure database hosting), Resend (transactional email delivery), and Vercel (website hosting and privacy-friendly analytics). These providers may store data on servers located outside Canada. We keep inquiry and order records only as long as necessary to serve you and to meet our legal and accounting obligations.
               </p>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   This site uses a single first-party cookie to keep the site administrator signed in, along with privacy-friendly analytics that do not use advertising cookies. You can control or disable cookies through your browser settings.
               </p>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   To access, correct, or delete the personal information we hold about you, contact us at <a href="mailto:info@meltingmoments.ca" style={{ textDecoration: 'underline' }}>info@meltingmoments.ca</a> or 250-385-2462.
               </p>
               <p style={{ opacity: 0.4, fontSize: 'var(--text-micro)', marginTop: '4rem' }}>
                   Last updated: June 2026
               </p>
            </div>
        </header>
    </div>
  );
}
