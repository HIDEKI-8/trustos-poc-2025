'use client';

import { WagmiConfig, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { polygon } from 'viem/chains';
import type { Connector } from 'wagmi';

import { walletConnect, injected } from '@wagmi/connectors';
// ↑ これ自体はOK。実際に metaMask コネクタ本体は “ブラウザでのみ” require します。

const queryClient = new QueryClient();

const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com'),
  },
  ssr: true,
  // ここがポイント：関数で動的にコネクタを決める
  connectors: () => {
    const list: Connector[] = [];

    // WalletConnect（どの環境でも使える）
    list.push(walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
      showQrModal: true,
    }));

    // ブラウザ環境なら MetaMask コネクタを動的にロード
    if (typeof window !== 'undefined') {
      try {
        // require はクライアント側でのみ実行される
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { metaMask } = require('@wagmi/connectors');
        list.unshift(metaMask()); // 優先的に表示したければ先頭に
      } catch {
        // 読めなくても無視（WalletConnectでカバー）
      }

      // Injected（拡張系全般）
      list.push(injected());
    }

    return list;
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>{children}</WagmiConfig>
    </QueryClientProvider>
  );
}
