'use client';

import { WagmiConfig, http, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { polygon } from 'viem/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const queryClient = new QueryClient();

// WalletConnect の Project ID（未取得なら仮でOK。あとで Vercel の環境変数に入れます）
const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'your_project_id_here';

const config = createConfig({
  chains: [polygon],
  connectors: [
    injected(),
    walletConnect({
      projectId: WALLET_CONNECT_PROJECT_ID,
      metadata: {
        name: 'TrustOS PoC',
        description: 'TrustOS Proof of Concept',
        url: 'https://trustos-poc-2025.vercel.app',
        icons: ['https://trustos-poc-2025.vercel.app/favicon.ico'],
      },
    }),
  ],
  transports: {
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com'),
  },
  ssr: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>{children}</WagmiConfig>
    </QueryClientProvider>
  );
}
