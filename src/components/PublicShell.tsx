'use client';
import { usePathname } from 'next/navigation';
import GlobalNav from '@/components/GlobalNav';
import Footer from '@/components/Footer';
import Preloader from '@/components/Preloader';
import PageTransition from '@/components/PageTransition';

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Admin pages use their own layout; skip all public chrome
    return <>{children}</>;
  }

  return (
    <>
      <Preloader />
      {/* On Guido's pages the content starts below the Guido's bar, so skip that too */}
      <a href={pathname.startsWith('/guidos') ? '#gg-content' : '#main-content'} className="skip-nav">Skip to main content</a>
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
