import Link from 'next/link';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
          Sorry, we couldn&apos;t find the page you were looking for. It might have been moved or deleted.
        </p>
        <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Return Home
        </Link>
      </div>
      <Footer />
    </>
  );
}
