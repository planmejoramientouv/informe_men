// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/_next') || pathname.startsWith('/assets')) return NextResponse.next();
    
    const protectedRoutes = [
        '/login',
        '/public'
    ];

    if (!protectedRoutes.some(route => pathname.startsWith(route))) {
        const isAuthenticated = await checkAuthentication(request);

        if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

async function checkAuthentication(request) {
  const token = request.cookies.get('auth');
  return token ? true : false;
}