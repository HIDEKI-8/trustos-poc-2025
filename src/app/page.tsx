// src/app/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * 型安全に window.ethereum を扱うための宣言（any を直接使わない）
 */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

type SectionState = 'idle' | 'loading' | 'done' | 'error';

/** シンプルな useInterval フック（型安全） */
function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current?.(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// 簡易デバッグログ（DOM に吐く — サーバーサイドでは何もしない）
function debugLog(...args: unknown[]) {
  try {
    const el = typeof document !== 'undefined' ? document.getElementById('debug-log') : null;
    const txt = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    if (el) {
      el.textContent += txt + '\n';
    } else {
      // サーバー側 / テスト環境ではコンソール
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  } catch {
    // ignore
  }
}

export default function Home() {
  // wallet state (minimal, using window.ethereum)
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // UI states
  const [score, setScore] = useState<number | null>(null);
  const [aiState, setAiState] = useState<SectionState>('idle');
  const [daoState, setDaoState] = useState<SectionState>('idle');
  const [info, setInfo] = useState<string>('');

  // simple heartbeat (example of useInterval usage)
  useInterval(() => {
    // placeholder for periodic checks if needed
    // debugLog('heartbeat', new Date().toISOString());
  }, 2000);

  // error -> string safe helper
  const errToString = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    try {
      return JSON.stringify(err);
    } catch {
      return 'Unknown error';
    }
  };

  // MetaMask connect (typed via global Window.ethereum declaration)
  const connectMetaMask = async (): Promise<void> => {
    setInfo('');
    try {
      const eth = typeof window !== 'undefined' ? window.ethereum : undefined;
      if (!eth) {
        setInfo('No injected wallet found. Please install MetaMask or use WalletConnect on mobile.');
        return;
      }

      // request accounts (this opens MetaMask)
      const accountsRaw = await eth.request({ method: 'eth_requestAccounts' }).catch((e) => {
        throw e;
      });

      // accountsRaw is unknown -> guard then convert
      if (Array.isArray(accountsRaw) && accountsRaw.length > 0) {
        const acct = String(accountsRaw[0]);
        setIsConnected(true);
        setAddress(acct);
        setInfo('Connected to MetaMask');
        debugLog('Connected accounts:', acct);
      } else {
        // some wallets return a single string
        if (typeof accountsRaw === 'string' && accountsRaw.length > 0) {
          setIsConnected(true);
          setAddress(accountsRaw);
          setInfo('Connected to MetaMask');
          debugLog('Connected accounts:', accountsRaw);
        } else {
          setInfo('No accounts returned by wallet.');
        }
      }
    } catch (err: unknown) {
      const m = errToString(err);
      setInfo(m);
      debugLog('connectMetaMask error:', m);
    }
  };

  // Generic connect handler (for future extension)
  const doConnect = async (kind: 'metaMask' | 'walletConnect' | 'injected') => {
    setInfo('');
    if (kind === 'metaMask' || kind === 'injected') {
      await connectMetaMask();
    } else {
      setInfo('WalletConnect not wired in this minimal build.');
    }
  };

  // Generate pseudo trust score
  const handleGenerateScore = async (): Promise<void> => {
    try {
      setAiState('loading');
      setInfo('');
      await new Promise((r) => setTimeout(r, 600));
      const pseudo = Math.round(820 + Math.random() * 140); // 820〜960
      const pct = Math.max(0, Math.min(100, Math.round(((pseudo - 600) / 400) * 100)));
      setScore(pct);
      setAiState('done');
    } catch (err: unknown) {
      setAiState('error');
      setInfo(errToString(err));
    }
  };

  // Mock submit to DAO (POST)
  const handleSubmitDao = async (): Promise<void> => {
    try {
      setDaoState('loading');
      setInfo('');
      await fetch('/api/dao/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address ?? null, score: score ?? null }),
      }).catch(() => {
        /* ignore network errors in PoC */
      });
      setDaoState('done');
    } catch (err: unknown) {
      setDaoState('error');
      setInfo(errToString(err));
    }
  };

  // UI styles
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
  const disabledBtn: React.CSSProperties = { ...btn, opacity: 0.5, cursor: 'not-allowed' };

  // client-only debug info on mount
  useEffect(() => {
    debugLog('userAgent:', typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown');
    debugLog('window.ethereum exists:', typeof window !== 'undefined' && !!window.ethereum);
  }, []);

  return (
    <main
      style={{
        minHeight: '100svh',
        color: '#e7f6ff',
        background: 'radial-gradient(1200px 600px at 50% -10%, #243d5a 0%, #0b1324 60%, #0b1324 100%)',
        padding: '36px 18px 80px',
      }}
    >
      <div style={{ marginTop: 30, padding: 10, background: '#111', color: '#0f0', fontSize: 12 }}>
        <div>DEBUG LOG:</div>
        <pre id="debug-log" style={{ whiteSpace: 'pre-wrap' }} />
      </div>

      <h1 style={{ textAlign: 'center', opacity: 0.95, letterSpacing: 1 }}>TRUST OS PoC</h1>

      {/* Connect セクション */}
      <section style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Connect your wallet / ウォレットを接続</h3>

        <div>
          <button style={btn} onClick={() => doConnect('injected')}>
            Connect Injected / MetaMask
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

        {info && <div style={{ color: '#ff6b6b', marginTop: 10, fontSize: 13 }}>{info}</div>}
      </section>

      {/* AI スコア */}
      <section style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>AI Analysis → Trust Score</h3>

        <button style={aiState === 'loading' ? disabledBtn : btn} disabled={aiState === 'loading'} onClick={handleGenerateScore}>
          {aiState === 'loading' ? 'Generating…' : 'Generate Trust Score'}
        </button>

        <div style={{ marginTop: 10, fontSize: 14 }}>
          {score !== null ? (
            <div>
              <div>
                Your current score: <strong>{score}%</strong>
              </div>
              <div style={{ marginTop: 8, width: '100%', background: 'rgba(255,255,255,0.06)', height: 12, borderRadius: 8 }}>
                <div style={{ width: `${score}%`, height: '100%', borderRadius: 8, background: 'linear-gradient(90deg,#27e1c1,#4ad6ff)' }} />
              </div>
            </div>
          ) : (
            <span style={{ opacity: 0.8 }}>No score yet. Click generate.</span>
          )}
        </div>
      </section>

      {/* DAO 承認 */}
      <section style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>DAO Approval (Mock)</h3>
        <p style={{ marginTop: 0, opacity: 0.85 }}>Community votes to verify your trust score / DAO投票でスコア承認（モック）</p>

        <button style={daoState === 'loading' || score === null ? disabledBtn : btn} disabled={daoState === 'loading' || score === null} onClick={handleSubmitDao}>
          {daoState === 'loading' ? 'Submitting…' : 'Submit to DAO / 承認申請'}
        </button>

        <div style={{ marginTop: 10, fontSize: 14 }}>
          {daoState === 'done' && <span>Submitted. (Mock) スコア承認申請を送信しました。</span>}
          {daoState === 'error' && <span style={{ color: '#ff6b6b' }}>Submission failed. もう一度お試しください。</span>}
          {score === null && <span style={{ opacity: 0.7 }}>※ 先に「Generate Trust Score」でスコアを作成してください。</span>}
        </div>
      </section>
    </main>
  );
}
