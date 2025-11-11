// next.config.ts (動作確認用・型依存を外したバージョン)
import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self' https:; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; " + // 一時的許可（動作確認用）
      "style-src 'self' 'unsafe-inline' https:; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https: wss:; " +
      "frame-ancestors 'self';"
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  },

  // 型注釈を避けて any を使う（ビルド時のエラーを防ぐ）
  webpack: (config: any, options: { dev: boolean }) => {
    const { dev } = options;
    if (!dev) {
      // 本番では eval 系ソースマップを無効化
      (config as any).devtool = false;
    }
    return config;
  }
};

export default nextConfig;
