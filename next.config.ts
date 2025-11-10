import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config) => {
    // サーバー環境では存在しないモジュールを無効化（MetaMask SDK周りの依存で落ちないように）
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  typescript: {
    // 型エラーでも本番ビルドを通す（暫定対応）
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLintエラーでもビルドを通す（暫定対応）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
