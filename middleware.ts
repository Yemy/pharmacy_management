import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    const role = token.role as string;
    if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // 2. Protect Shop Checkout / Profile
  if (pathname.startsWith('/shop/checkout') || pathname.startsWith('/shop/orders') || pathname.startsWith('/profile')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/shop/checkout/:path*', '/shop/orders/:path*', '/profile/:path*'],
};