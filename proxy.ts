import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

const intlMiddleware = createMiddleware({
  locales: ['en', 'am', 'om'],
  defaultLocale: 'en'
});

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith('/admin') || /^\/(?:en|am|om)\/admin(\/|$)/.test(pathname);
  const isLoginPath = pathname.startsWith('/admin/login') || /^\/(?:en|am|om)\/admin\/login(\/|$)/.test(pathname);

  // Protect all /admin routes except /admin/login
  if (isAdminPath && !isLoginPath) {
    const session = await auth();
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // In a production scenario with the database session, we could also call
    // an endpoint or check the DB here, but next-auth JWT is verified.
    // SEC-ACL-01: Server actions and API routes must re-verify against the DB.
    
    return NextResponse.next();
  }
  
  if (isAdminPath) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/uploads') || pathname.startsWith('/mock-storage')) {
    return NextResponse.next();
  }

  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
    return NextResponse.next();
  }

  // Use next-intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|uploads|mock-storage|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|woff2?|map|txt|xml|mp4|webm|ogg|mp3|wav|pdf|mov)).*)'],
};
