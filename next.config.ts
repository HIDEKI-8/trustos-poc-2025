// next.config.ts (プロジェクト直下)
import type { NextConfig } from 'next';

const csp = [
  "default-src 'self' https:;",
  // 本番では 'unsafe-eval' を使わないのが望ましい（下記は例：ここでは外しています）
  "script-src 'self' https:;",
  "style-src 'self' 'unsafe-inline' https:;",
  "img-src 'self' data: https:;",
  "connect-src 'self' https: wss:;",
  "frame-ancestors 'self';",
].join(' ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)', // 全ルートに適用
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          // 必要なら他のヘッダもここで追加可能
          // { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;

