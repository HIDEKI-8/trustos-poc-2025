'use client';

import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function Home() {
  // wagmi v2：useConnect は引数なしで呼び出し、実行時に connector を渡す
  const { connect, isPending, error: connectError } = useConnect();
  const { address, isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();

  const connectInjected = () => connect({ connector: injected() });

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>TrustOS PoC</h1>

      {!isConnected ? (
        <button onClick={connectInjected} disabled={isPending} style={{ padding: '8px 14px' }}>
          {isPending ? 'Connecting…' : 'Connect Wallet (Injected)'}
        </button>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <strong>Connected:</strong> {address}
          </div>
          <button onClick={() => disconnect()} style={{ padding: '8px 14px' }}>
            Disconnect
          </button>
        </>
      )}

      <div style={{ marginTop: 12, color: '#666' }}>
        <div>Account status: {status}</div>
        {connectError && (
          <div style={{ color: 'crimson', marginTop: 8 }}>
            {connectError.message}
          </div>
        )}
      </div>

      {/* 既存のUIがあればこの下に置いてOK */}
    </main>
  );
}
