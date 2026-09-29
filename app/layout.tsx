import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: {
    template: '%s | Gurmesa',
    default: 'Gurmesa - Full Stack Developer',
  },
  description: 'Personal portfolio and developer blog.',
  openGraph: {
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
