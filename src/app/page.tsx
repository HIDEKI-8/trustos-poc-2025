'use client';

import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function Home() {
  // wagmi hooks
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    connect,
    connectors,          // providers.tsx で定義した connector 一覧
    isPending,           // 接続中フラグ
    pendingConnector,    // 接続中の connector
    error,
  } = useConnect();

  // 利用するコネクタを取得（id は 'injected' / 'walletConnect'）
  const injectedConnector = connectors.find((c) => c.id === 'injected');
  const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect');

  const handleConnectInjected = () => {
    if (!injectedConnector) {
      alert('Injected (MetaMask拡張) が利用できません。PCブラウザでお試しください。');
      return;
    }
    connect({ connector: injectedConnector });
  };

  const handleConnectWalletConnect = () => {
    if (!walletConnectConnector) {
      alert('WalletConnect が構成されていません。providers.tsx の設定を確認してください。');
      return;
    }
    // スマホMetaMask（クラウドログイン版）はこちら
    connect({ connector: walletConnectConnector });
  };

  return (
    <main style={{ padding: 32, color: '#eee', minHeight: '100vh', background: 'linear-gradient(180deg,#1a1633,#0f0e1a)' }}>
      <h1 style={{ marginBottom: 16 }}>TrustOS PoC</h1>

      {!isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
          <button
            onClick={handleConnectInjected}
            disabled={!injectedConnector || (isPending && pendingConnector?.id === injectedConnector?.id)}
            style={{ padding: '10px 14px', cursor: 'pointer' }}
          >
            {isPending && pendingConnector?.id === injectedConnector?.id
              ? 'Connecting… (Injected)'
              : 'Connect with MetaMask (PC / Injected)'}
          </button>

          <button
            onClick={handleConnectWalletConnect}
            disabled={!walletConnectConnector || (isPending && pendingConnector?.id === walletConnectConnector?.id)}
            style={{ padding: '10px 14px', cursor: 'pointer' }}
          >
            {isPending && pendingConnector?.id === walletConnectConnector?.id
              ? 'Connecting… (WalletConnect)'
              : 'Connect with WalletConnect (Mobile)'}
          </button>

          {error ? (
            <div style={{ color: '#ff7b7b' }}>
              {String(error?.message ?? 'Failed to connect')}
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div><strong>Connected:</strong> {address}</div>
          <button onClick={() => disconnect()} style={{ padding: '10px 14px', cursor: 'pointer' }}>
            Disconnect
          </button>
        </div>
      )}

      <div style={{ marginTop: 16, opacity: 0.8 }}>
        Account status: {isConnected ? 'connected' : 'disconnected'}
      </div>
    </main>
  );
}
