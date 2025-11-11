// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 🔐 Content-Security-Policy
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com",
      "connect-src 'self' https://rpc.walletconnect.com https://*.walletconnect.com https://cloudflare-ipfs.com",
      "img-src * blob: data:",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "frame-src https://*.walletconnect.com",
    ].join("; ")
  );

  return res;
}

export const config = {
  matcher: "/:path*",
};