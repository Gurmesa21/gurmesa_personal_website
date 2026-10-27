import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SkipToContent } from '@/components/layout/skip-to-content';
import { TabVisibilityRefresher } from '@/components/utils/TabVisibilityRefresher';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white">
      <TabVisibilityRefresher />
      <SkipToContent />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
