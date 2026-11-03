import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SkipToContent } from '@/components/layout/skip-to-content';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-testid="public-layout-root"
      className="min-h-screen flex flex-col bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white overflow-x-clip"
    >
      <SkipToContent />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
