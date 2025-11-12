// next.config.ts（プロジェクトルート）
import type { NextConfig } from 'next';

const cspValue = "default-src 'self' https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self';";

const nextConfig: NextConfig = {
  // その他既存設定を残す
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspValue },
          // 必要なら他のヘッダーもここに追加
        ],
      },
    ];
  },
};

export default nextConfig;
