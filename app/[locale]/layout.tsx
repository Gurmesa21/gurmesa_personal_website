import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Noto_Sans_Ethiopic } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading', display: 'swap' });
const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-ethiopic',
});

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

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'am' }, { locale: 'om' }];
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${locale === 'am' ? notoSansEthiopic.variable + ' font-ethiopic' : ''}`}>
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground font-sans w-full">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {props.children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
