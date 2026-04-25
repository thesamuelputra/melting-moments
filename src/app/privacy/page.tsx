import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Melting Moments Catering',
  description: 'Privacy policy for Melting Moments Catering — how we handle your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div>
        <header className="container" style={{ paddingTop: "clamp(8rem, 15vw, 12rem)", paddingBottom: "clamp(4rem, 10vw, 8rem)" }}>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Privacy Policy</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>
            
            <div style={{ maxWidth: '800px', margin: '4rem auto 0 auto' }}>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   At Melting Moments, we respect your privacy. Any personal information provided through our contact forms (including name, email, and event details) is used strictly for the purpose of communicating with you regarding your catering inquiry. We do not sell, trade, or otherwise transfer your personal information to outside parties.
               </p>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   This site may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings.
               </p>
            </div>
        </header>
    </div>
  );
}
