// src/app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import Providers from './providers'; // ← 既に作った providers.tsx を使う

export const metadata: Metadata = {
  title: 'TRUST OS PoC',
  description: 'Wallet connect + AI trust score (PoC)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
          backgroundColor: '#0b1324',
        }}
      >
        {/* wagmi / QueryClient / MetaMask SDK などをここで包む */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
