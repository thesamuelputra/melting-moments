'use client';
import { usePathname } from 'next/navigation';
import GlobalNav from '@/components/GlobalNav';
import Footer from '@/components/Footer';
import ScrollIndicator from '@/components/ScrollIndicator';
import Preloader from '@/components/Preloader';
import PageTransition from '@/components/PageTransition';

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Admin pages use their own layout — skip all public chrome
    return <>{children}</>;
  }

  return (
    <>
      <Preloader />
      <a href="#main-content" className="skip-nav">Skip to main content</a>
      <ScrollIndicator />
      <GlobalNav />
      <main id="main-content">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
