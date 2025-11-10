'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const isMobileUA = () =>
  typeof navigator !== 'undefined' &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function Page() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error, status } = useConnect();
  const { disconnect } = useDisconnect();

  // WalletConnect コネクタを取得
  const wcConnector = useMemo(
    () =>
      connectors.find(
        (c) =>
          c.id?.toLowerCase().includes('walletconnect') ||
          c.name === 'WalletConnect'
      ),
    [connectors]
  );

  // 自動接続は1回だけ
  const triedRef = useRef(false);

  useEffect(() => {
    if (triedRef.current) return;
    if (!isConnected && isMobileUA() && wcConnector) {
      triedRef.current = true;
      connect({ connector: wcConnector });
    }
  }, [isConnected, wcConnector, connect]);

  return (
    <main
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '48px 16px',
        color: '#d8f3f3',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>TRUST OS PoC</h1>

      {/* Connect セクション */}
      {!isConnected ? (
        <section
          style={{
            border: '1px solid #224',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          <h3 style={{ textAlign: 'center', marginBottom: 12 }}>
            Connect your wallet / ウォレットを接続
          </h3>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {/* Injected (MetaMask拡張 or アプリ内ブラウザ) */}
            {connectors
              .filter((c) => c.id.toLowerCase().includes('injected'))
              .map((c) => (
                <button
                  key={c.id}
                  disabled={isPending}
                  onClick={() => connect({ connector: c })}
                  style={btnStyle()}
                >
                  Connect Injected
                </button>
              ))}

            {/* WalletConnect（スマホはアプリ遷移 / PCはQR） */}
            {wcConnector && (
              <button
                disabled={isPending}
                onClick={() => connect({ connector: wcConnector })}
                style={btnStyle()}
              >
                Connect WalletConnect
              </button>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 12, minHeight: 22 }}>
            {isPending && <span>Connecting...</span>}
            {status === 'error' && (
              <span style={{ color: 'salmon' }}>{String(error?.message || 'Error')}</span>
            )}
          </div>
        </section>
      ) : (
        <section
          style={{
            border: '1px solid #224',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong>Connected:</strong> {address}
          </div>
          <button onClick={() => disconnect()} style={btnStyle()}>
            Disconnect
          </button>
        </section>
      )}

      {/* AI → Trust Score（ダミー） */}
      <section
        style={{
          border: '1px solid #224',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          background: 'rgba(0,0,0,0.3)',
        }}
      >
        <h3>AI Analysis → Trust Score</h3>
        <button
          onClick={() => alert('Trust score generated (mock).')}
          style={btnStyle()}
        >
          Generate Trust Score
        </button>
      </section>

      {/* DAO 承認（モック） */}
      <section
        style={{
          border: '1px solid #224',
          borderRadius: 12,
          padding: 16,
          background: 'rgba(0,0,0,0.3)',
        }}
      >
        <h3>DAO Approval (Mock)</h3>
        <p style={{ marginTop: 4 }}>
          Community votes to verify your trust score / DAO投票でスコア承認
        </p>
        <button
          onClick={() => alert('Submitted to DAO (mock).')}
          style={btnStyle()}
        >
          Submit to DAO / 承認申請
        </button>
      </section>
    </main>
  );
}

function btnStyle(): React.CSSProperties {
  return {
    padding: '12px 18px',
    borderRadius: 10,
    border: '1px solid #22b8b8',
    background: '#1dd3c0',
    color: '#063',
    fontWeight: 700,
    cursor: 'pointer',
  };
}
