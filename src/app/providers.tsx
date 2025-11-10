'use client';

import { WagmiConfig, http, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { polygonAmoy } from 'viem/chains'; // ← Amoy テストネット用
import { createPublicClient } from 'viem';

// QueryClient の初期化
const queryClient = new QueryClient();

// wagmi 設定
const config = createConfig({
chains: [polygonAmoy],
transports: {
[polygonAmoy.id]: http(
process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology'
),
},
ssr: true,
});

// Providers コンポーネント
export default function Providers({ children }: { children: React.ReactNode }) {
return (
<QueryClientProvider client={queryClient}>
<WagmiConfig config={config}>{children}</WagmiConfig>
</QueryClientProvider>
);
}