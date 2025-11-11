// next.config.js (preview 用に一時的に unsafe-eval を許可するバージョン)
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self' https:; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https: wss:; " +
      "frame-ancestors 'self';"
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  }
];

const nextConfig = {
  reactStrictMode: true,
  // 既存の export / other config があれば保持してください
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  },
  // 本番での source map をオフにするオプション（下の恒久対策でも使います）
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    // 本番で eval 系の devtool を無効化
    if (!dev) {
      config.devtool = false;
    }
    return config;
  }
};

module.exports = nextConfig;
