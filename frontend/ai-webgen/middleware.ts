import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const res = NextResponse.next();

  if (url.startsWith('/signIn') || url.startsWith('/signUp')) {
    res.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  } else if (url.startsWith('/editor')||url.startsWith('/mobile/editor')) {
    res.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  }

  return res;
}

export const config = {
  matcher: ['/signIn', '/signUp', '/editor/:path*' , '/mobile/editor/:path*'],
};