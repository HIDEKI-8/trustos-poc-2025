'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { ReactNode } from 'react';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
const WC_PID  = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;

export const config = createConfig({
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(RPC_URL),
  },
  connectors: [
    injected({ shimDisconnect: true }),          // ブラウザ拡張 / MetaMaskアプリ内ブラウザ
    metaMask({ dappMetadata: { name: 'TRUST OS PoC' } }), // MetaMask専用
    walletConnect({ projectId: WC_PID }),       // Safari/Chrome→MetaMaskアプリ
  ],
  ssr: true,
});

export default function Providers({ children }: { children: ReactNode }) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
