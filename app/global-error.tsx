'use client';

import Link from 'next/link';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gray-50">
          <h2 className="text-3xl font-bold mb-4 text-red-600">Critical Application Error</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            The application encountered a critical error. Please try again later.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => reset()}
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Try again
            </button>
            <Link href="/" className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
