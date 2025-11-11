// next.config.js
/**
 * 動作確認用: CSP に 'unsafe-eval' を一時的に追加します（セキュリティリスクあり）。
 * TypeScript のチェックで "implicit any" エラーが出ないよう JSDoc で型注釈しています。
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 本番での source map をオフに（eval source maps を除去する目的）
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' }
        ]
      }
    ];
  },

  /**
   * webpack フックの引数に対して暗黙 any を避けるため JSDoc で注釈しています。
   *
   * @param {import('webpack').Configuration} config
   * @param {{ dev: boolean }} options
   */
  webpack: (
    /** @type {import('webpack').Configuration} */ config,
    /** @type {{ dev: boolean }} */ options
  ) => {
    const { dev } = options;
    if (!dev) {
      // 本番では devtool を無効にして eval 系 source map の混入を抑える
      // @ts-ignore -- 一部の webpack 型環境で devtool の型が厳密な場合に備えて ignore
      config.devtool = false;
    }
    return config;
  }
};

module.exports = nextConfig;
