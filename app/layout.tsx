import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { SkipToContent } from '../components/layout/skip-to-content';

export const metadata: Metadata = {
  title: 'Gurmesa - Full Stack Developer',
  description: 'Personal portfolio and developer blog.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground">
        <SkipToContent />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
