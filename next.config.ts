/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // サーバー環境では存在しないモジュールを無効化（MetaMask SDK周りの依存で落ちないように）
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
  // 念のため：画像などの最適化を使っていなければ無効でもOK
  images: { unoptimized: true },
};

module.exports = nextConfig;
