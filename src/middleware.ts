import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

import { auth } from '@/modules/infrastructure/auth/auth';
import { routing } from '@/shared/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const publicPaths = ['/login'];

/**
 * Combines next-intl routing with Auth.js session protection.
 */
export default auth((request) => {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(en|pt-BR)(?=\/|$)/);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const pathnameWithoutLocale = localeMatch
    ? pathname.slice(localeMatch[0].length) || '/'
    : pathname;

  const isPublic = publicPaths.some(
    (path) => pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(`${path}/`),
  );

  const isLoggedIn = Boolean(request.auth);

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL(`/${locale}/login`, request.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathnameWithoutLocale === '/login') {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.nextUrl.origin));
  }

  return intlMiddleware(request as NextRequest);
});

export const config = {
  matcher: ['/', '/(en|pt-BR)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
