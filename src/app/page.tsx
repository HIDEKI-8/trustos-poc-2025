'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';

type SectionState = 'idle' | 'loading' | 'done' | 'error';

export default function Home() {
  // wallet state
  const { address, isConnected } = useAccount();
  const {
    connect,
    connectAsync,
    connectors,
    isPending,
    error: connectError,
  } = useConnect();

  // UI states
  const [score, setScore] = useState<number | null>(null);
  const [aiState, setAiState] = useState<SectionState>('idle');
  const [daoState, setDaoState] = useState<SectionState>('idle');
  const [info, setInfo] = useState<string>('');

  // どのコネクタが利用可能かをメモ化
  const injected = useMemo(
    () => connectors.find((c) => c.id === 'injected'),
    [connectors]
  );
  const metaMask = useMemo(
    () => connectors.find((c) => c.id === 'metaMask'),
    [connectors]
  );
  const walletConnect = useMemo(
    () => connectors.find((c) => c.id === 'walletConnect'),
    [connectors]
  );

  {/* Reset sessionStorage for mobile Safari */}
<div style={{ marginTop: 8 }}>
  <button
    style={{
      background: 'transparent',
      border: '1px dashed rgba(255,255,255,.4)',
      color: 'rgba(255,255,255,.8)',
      padding: '8px 12px',
      borderRadius: 8,
      cursor: 'pointer',
    }}
    onClick={() => {
      try {
        sessionStorage.removeItem('wc_auto_opened');
        localStorage.removeItem('wc_auto_opened');
        alert('✅ Reset complete! Please reload and try again.');
      } catch (e) {
        alert('⚠️ Failed to reset: ' + e);
      }
    }}
  >
    Reset mobile connect flags
  </button>
</div>


  // ---- スマホ自動検出 → WalletConnect モーダル自動オープン ----
  useEffect(() => {
    const flagKey = 'wc_auto_opened';
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

    if (!isMobile) return; // PCでは自動起動しない
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(flagKey) === '1') return; // 1回だけ自動起動
    if (!walletConnect) return;

    (async () => {
      try {
        await connectAsync({ connector: walletConnect });
      } catch {
        // ユーザー拒否等は無視
      } finally {
        try {
          sessionStorage.setItem(flagKey, '1');
        } catch {
          // sessionStorage不可環境は無視
        }
      }
    })();
  }, [connectAsync, walletConnect]);

  // ---- ハンドラ ----
  const doConnect = async (kind: 'injected' | 'metaMask' | 'walletConnect') => {
    try {
      setInfo('');
      const connector =
        kind === 'injected'
          ? injected
          : kind === 'metaMask'
          ? metaMask
          : walletConnect;

      if (!connector) {
        setInfo(`Connector "${kind}" is not available on this device.`);
        return;
      }
      await connectAsync({ connector });
    } catch (e) {
      // 表示に十分な簡易エラー文面
      setInfo(
        e instanceof Error ? `Connect error: ${e.message}` : 'Connect failed.'
      );
    }
  };

  const handleGenerateScore = async () => {
    try {
      setAiState('loading');
      setInfo('');
      // PoC 用のダミー計算（820〜960）
      await new Promise((r) => setTimeout(r, 800));
      const pseudo = Math.round(820 + Math.random() * 140);
      setScore(pseudo);
      setAiState('done');
    } catch {
      setAiState('error');
    }
  };

  const handleSubmitDao = async () => {
    try {
      setDaoState('loading');
      setInfo('');
      // API ルートにアドレスとスコアを送信（存在しなくても安全な形）
      await fetch('/api/dao/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address ?? null,
          score: score ?? null,
        }),
      });
      setDaoState('done');
    } catch {
      setDaoState('error');
    }
  };

  // ---- 簡易スタイル ----
  const card: React.CSSProperties = {
    padding: 18,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    margin: '16px auto',
    maxWidth: 720,
  };
  const btn: React.CSSProperties = {
    background: '#27e1c1',
    border: 'none',
    color: '#0b1324',
    fontWeight: 700,
    borderRadius: 10,
    padding: '14px 18px',
    cursor: 'pointer',
    marginRight: 12,
    marginBottom: 12,
  };
  const disabledBtn: React.CSSProperties = {
    ...btn,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  return (
    <main
      style={{
        minHeight: '100svh',
        color: '#e7f6ff',
        background:
          'radial-gradient(1200px 600px at 50% -10%, #243d5a 0%, #0b1324 60%, #0b1324 100%)',
        padding: '36px 18px 80px',
      }}
    >
      <h1 style={{ textAlign: 'center', opacity: 0.9, letterSpacing: 1 }}>
        TRUST OS PoC
      </h1>

      {/* Connect セクション */}
      <section style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>
          Connect your wallet / ウォレットを接続
        </h3>

        <div>
          {/* 常に押せるようにする（利用不可は doConnect 内で案内） */}
          <button style={btn} onClick={() => doConnect('injected')}>
            Connect Injected
          </button>

          <button style={btn} onClick={() => doConnect('walletConnect')}>
            Connect WalletConnect
          </button>

          <button style={btn} onClick={() => doConnect('metaMask')}>
            Connect MetaMask
          </button>
        </div>

        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
          {isConnected ? (
            <span>
              Connected: <strong>{address}</strong>
            </span>
          ) : (
            <span>Account status: disconnected</span>
          )}
        </div>

        {(connectError || info) && (
          <div style={{ color: '#ff6b6b', marginTop: 10, fontSize: 13 }}>
            {connectError?.message || info}
          </div>
        )}
      </section>

      {/* AI スコア */}
      <section style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>
          AI Analysis → Trust Score
        </h3>

        <button
          style={aiState === 'loading' ? disabledBtn : btn}
          disabled={aiState === 'loading'}
          onClick={handleGenerateScore}
        >
          {aiState === 'loading' ? 'Generating…' : 'Generate Trust Score'}
        </button>

        <div style={{ marginTop: 10, fontSize: 14 }}>
          {score !== null && (
            <span>
              Your current score: <strong>{score}</strong>
            </span>
          )}
        </div>
      </section>

      {/* DAO 承認 */}
      <section style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>DAO Approval (Mock)</h3>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          Community votes to verify your trust score / DAO投票でスコア承認
        </p>

        <button
          style={daoState === 'loading' || score === null ? disabledBtn : btn}
          disabled={daoState === 'loading' || score === null}
          onClick={handleSubmitDao}
        >
          {daoState === 'loading' ? 'Submitting…' : 'Submit to DAO / 承認申請'}
        </button>

        <div style={{ marginTop: 10, fontSize: 14 }}>
          {daoState === 'done' && (
            <span>Submitted. (Mock) スコア承認申請を送信しました。</span>
          )}
          {daoState === 'error' && (
            <span style={{ color: '#ff6b6b' }}>
              Submission failed. もう一度お試しください。
            </span>
          )}
          {score === null && (
            <span style={{ opacity: 0.7 }}>
              ※ 先に「Generate Trust Score」でスコアを作成してください。
            </span>
          )}
        </div>
      </section>
    </main>
  );
}
