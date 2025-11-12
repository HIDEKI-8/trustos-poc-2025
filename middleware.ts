// middleware.ts (プロジェクトルート)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const csp = `
    default-src 'self' https:;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;
    style-src 'self' 'unsafe-inline' https:;
    img-src 'self' data: https:;
    connect-src 'self' https: wss:;
    frame-ancestors 'self';
  `.replace(/\s{2,}/g,' ').trim();

  res.headers.set('Content-Security-Policy', csp);
  return res;
}

export const config = { matcher: ['/:path*'] };
