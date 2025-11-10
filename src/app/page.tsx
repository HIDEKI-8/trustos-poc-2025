'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

export default function Home() {
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // UI states
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const [scoreMsg, setScoreMsg] = useState<string>('');
  const [daoMsg, setDaoMsg] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  // 画面幅でボタン等を少し大きめに
  const isMobile = useMemo(
    () =>
      typeof window !== 'undefined' &&
      /Mobi|Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent),
    []
  );

  // ❶ スマホ自動検出 → 初回のみ WalletConnect モーダルを自動オープン
  useEffect(() => {
    if (!isMobile || isConnected) return;

    // セッション中は1回だけ自動起動
    const flagKey = 'wcAutolaunched';
    const already = sessionStorage.getItem(flagKey);
    if (already) return;

    const wc = connectors.find((c) =>
      /walletconnect/i.test(c.id) || /walletconnect/i.test(c.name)
    );
    if (wc) {
      // WalletConnect 側の Project ID は providers.tsx / 環境変数で設定済み前提
      connect({ connector: wc }).finally(() => {
        sessionStorage.setItem(flagKey, '1');
      });
    }
  }, [isMobile, isConnected, connectors, connect]);

  // ❷ ウォレット接続ハンドラ
  const handleConnectInjected = async () => {
    setStatusMsg('');
    try {
      const inj =
        connectors.find((c) => /injected/i.test(c.id)) ||
        injected(); // 念のためフォールバック
      await connect({ connector: inj });
    } catch (e: any) {
      setStatusMsg(`Connect error: ${e?.message ?? String(e)}`);
    }
  };

  const handleConnectWC = async () => {
    setStatusMsg('');
    try {
      const wc =
        connectors.find((c) => /walletconnect/i.test(c.id)) ||
        walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! });
      await connect({ connector: wc });
    } catch (e: any) {
      setStatusMsg(`Connect error: ${e?.message ?? String(e)}`);
    }
  };

  // ❸ AIスコア（モック）: 画面内に結果を表示
  const handleGenerateScore = async () => {
    setScoreMsg('');
    setDaoMsg('');
    setBusy(true);
    try {
      // モック: 1.5秒後に 600〜900 のスコアを生成
      await new Promise((r) => setTimeout(r, 1500));
      const v = Math.floor(600 + Math.random() * 300);
      setScore(v);
      setScoreMsg('AI score generated successfully.');
    } catch (e: any) {
      setScoreMsg(`Score error: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  // ❹ DAO 承認申請（モック）
  const handleSubmitDAO = async () => {
    setDaoMsg('');
    if (!isConnected) {
      setDaoMsg('Please connect your wallet first.');
      return;
    }
    setBusy(true);
    try {
      // モック: 1.2秒後に“投票受付”を完了
      await new Promise((r) => setTimeout(r, 1200));
      const fakeTx = `0x${crypto
        .getRandomValues(new Uint8Array(8))
        .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '')}`;
      setDaoMsg(`Submitted to DAO (mock). Tx: ${fakeTx}`);
    } catch (e: any) {
      setDaoMsg(`DAO error: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0b1520',
        color: '#e8f1f8',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 720 }}>
        <h1
          style={{
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 1,
            opacity: 0.9,
            marginBottom: 18,
          }}
        >
          TRUST OS PoC
        </h1>

        {/* Wallet section */}
        <section
          style={{
            border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 14,
            padding: 16,
            marginBottom: 18,
            background: 'rgba(255,255,255,.04)',
          }}
        >
          <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>
            Connect your wallet / ウォレットを接続
          </h2>
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 8,
            }}
          >
            <button
              onClick={handleConnectInjected}
              disabled={isPending}
              style={btnStyle}
            >
              {isPending ? 'Connecting…' : 'Connect Injected'}
            </button>

            <button
              onClick={handleConnectWC}
              disabled={isPending}
              style={btnStyle}
            >
              {isPending ? 'Connecting…' : 'Connect WalletConnect'}
            </button>
          </div>

          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
            Status:{' '}
            {isConnected ? (
              <span style={{ color: '#7dffbc' }}>
                connected ({short(address)})
              </span>
            ) : (
              <span style={{ color: '#ffb2b2' }}>disconnected</span>
            )}
          </div>

          {connectError && (
            <div style={{ color: '#ff8f8f', marginTop: 6, fontSize: 13 }}>
              {connectError.message}
            </div>
          )}
          {statusMsg && (
            <div style={{ color: '#ff8f8f', marginTop: 4, fontSize: 13 }}>
              {statusMsg}
            </div>
          )}
        </section>

        {/* AI Score */}
        <section style={cardStyle}>
          <h3 style={cardTitle}>AI Analysis → Trust Score</h3>
          <button onClick={handleGenerateScore} disabled={busy} style={btnStyle}>
            {busy ? 'Generating…' : 'Generate Trust Score'}
          </button>
          <div style={{ marginTop: 10, fontSize: 14 }}>
            {score !== null && (
              <div>
                <strong>Score:</strong>{' '}
                <span style={{ color: '#7dffbc' }}>{score}</span>
              </div>
            )}
            {scoreMsg && <div style={{ opacity: 0.85 }}>{scoreMsg}</div>}
          </div>
        </section>

        {/* DAO Approval */}
        <section style={cardStyle}>
          <h3 style={cardTitle}>DAO Approval (Mock)</h3>
          <p style={{ marginTop: 0, opacity: 0.85 }}>
            Community votes to verify your trust score / DAO投票でスコア承認
          </p>
          <button onClick={handleSubmitDAO} disabled={busy} style={btnStyle}>
            {busy ? 'Submitting…' : 'Submit to DAO / 承認申請'}
          </button>
          {daoMsg && (
            <div style={{ marginTop: 10, fontSize: 14, opacity: 0.9 }}>
              {daoMsg}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ---------- helpers & styles ---------- */

function short(addr?: `0x${string}` | string) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const btnStyle: React.CSSProperties = {
  padding: '12px 18px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,.2)',
  background: '#19d3b6',
  color: '#0b1520',
  fontWeight: 700,
  cursor: 'pointer',
};

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.15)',
  borderRadius: 14,
  padding: 16,
  marginBottom: 18,
  background: 'rgba(255,255,255,.04)',
};

const cardTitle: React.CSSProperties = { fontSize: 16, margin: '0 0 8px' };
