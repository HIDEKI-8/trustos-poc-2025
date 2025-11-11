// next.config.ts
import type { NextConfig } from 'next';
import type { Configuration as WebpackConfiguration } from 'webpack';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self' https:; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; " + // 一時的に許可（動作確認用）
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
  // 本番での source map をオフにして eval 系 source map の混入を抑える（恒久対策でも使う）
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  },

  // TypeScript の型注釈を付与（暗黙の any を避ける）
  webpack: (config: WebpackConfiguration, options: { dev: boolean }) => {
    const { dev } = options;
    if (!dev) {
      // 一部の webpack 型定義に devtool が含まれない場合があるため any キャストしています
      // これはビルド時の型回避であり、安全な本番化の際は削除してください
      (config as any).devtool = false;
    }
    return config;
  }
};

export default nextConfig;
