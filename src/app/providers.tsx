'use client';

import { WagmiConfig, http, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { polygon } from 'viem/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com'),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!, // ← 必須
      showQrModal: true, // PCはQR、スマホはアプリ遷移
      metadata: {
        name: 'TrustOS PoC',
        description: 'WalletConnect for TrustOS',
        url: 'https://example.com', // 任意
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
      },
    }),
  ],
  ssr: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>{children}</WagmiConfig>
    </QueryClientProvider>
  );
}
