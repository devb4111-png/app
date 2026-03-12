import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Allow public routes
  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return NextResponse.next();
  }

  // Protect dashboard and other authenticated routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/tasks') || pathname.startsWith('/api/generate-schedule')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
