// src/app/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';

type SectionState = 'idle' | 'loading' | 'done' | 'error';

function shortAddress(addr: string | null) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export default function Page() {
  // wallet state
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // UI states
  const [score, setScore] = useState<number | null>(null);
  const [aiState, setAiState] = useState<SectionState>('idle');
  const [daoState, setDaoState] = useState<SectionState>('idle');
  const [info, setInfo] = useState<string>('');

  // detect injected provider (MetaMask)
  const hasInjected = useMemo(() => {
    if (typeof window === 'undefined') return false;
    // use a safe "any" cast to avoid ts-ignore/ts-expect-error ESLint complaints
    const eth = (window as any).ethereum;
    return Boolean(eth && typeof eth.request === 'function');
  }, []);

  // On mount, check accounts (MetaMask may keep connection)
  useEffect(() => {
    const check = async () => {
      try {
        const eth = (window as any).ethereum;
        if (!eth?.request) return;
        const accounts: string[] = await eth.request({ method: 'eth_accounts' });
        if (accounts?.length) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }
        // listen for account / chain changes
        const onAccountsChanged = (accounts: string[]) => {
          if (!accounts || accounts.length === 0) {
            setAddress(null);
            setIsConnected(false);
          } else {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        };
        const onChainChanged = () => {
          // reload to avoid inconsistent provider state
          window.location.reload();
        };

        eth.on?.('accountsChanged', onAccountsChanged);
        eth.on?.('chainChanged', onChainChanged);

        // cleanup on unmount
        return () => {
          try {
            eth?.removeListener?.('accountsChanged', onAccountsChanged);
            eth?.removeListener?.('chainChanged', onChainChanged);
          } catch (err) {
            // swallow cleanup errors
            console.warn('cleanup error', err);
          }
        };
      } catch (err) {
        // ignore initial detection errors
        // keep this minimal to avoid lint complaining about unused variables
        console.warn('eth detection error', err);
      }
    };

    const maybeCleanup = check();
    // when using async effect that returns cleanup, ensure we handle it
    // TypeScript/React will handle returned cleanup function
  }, []);

  // ---- Handlers ----

  // 1) Injected / MetaMask connect (direct via window.ethereum)
  const handleInjectedConnect = async () => {
    setInfo('');
    try {
      const eth = (window as any).ethereum;
      if (!eth?.request) {
        setInfo('No injected wallet found on this device.');
        return;
      }
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts?.length) {
        setAddress(accounts[0]);
        setIsConnected(true);
        setInfo('Connected to injected wallet.');
      } else {
        setInfo('No accounts returned.');
      }
    } catch (err) {
      // show meaningful message and keep err referenced so linter is happy
      console.error('connect error', err);
      const msg = err instanceof Error ? err.message : String(err);
      setInfo(`Connect failed: ${msg}`);
    }
  };

  // 2) WalletConnect placeholder (not full implementation)
  const handleWalletConnect = async () => {
    setInfo(
      'WalletConnect button pressed. For full WalletConnect please integrate a WalletConnect provider (recommended: wagmi + Web3Modal).'
    );
  };

  // 3) Generate pseudo trust score (PoC)
  const handleGenerateScore = async () => {
    try {
      setAiState('loading');
      setInfo('');
      await new Promise((r) => setTimeout(r, 700));
      const pseudo = Math.round(820 + Math.random() * 140); // 820〜960
      setScore(pseudo);
      setAiState('done');
    } catch (err) {
      console.error('score error', err);
      setAiState('error');
      setInfo('Score generation failed.');
    }
  };

  // 4) Submit to DAO (mock POST)
  const handleSubmitDao = async () => {
    if (!score) {
      setInfo('先にスコアを生成してください。');
      return;
    }
    setDaoState('loading');
    setInfo('');
    try {
      const res = await fetch('/api/dao/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address ?? null, score }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        setInfo(`Submission failed: ${res.status} ${res.statusText} ${t}`);
        setDaoState('error');
        return;
      }
      setDaoState('done');
      setInfo('Submitted (mock).');
    } catch (err) {
      console.error('submit error', err);
      setDaoState('error');
      setInfo(`Submission error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // ---- Styles (simple inline) ----
  const card: React.CSSProperties = {
    padding: 18,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    margin: '16px auto',
    maxWidth: 920,
  };
  const btn: React.CSSProperties = {
    background: '#27e1c1',
    border: 'none',
    color: '#0b1324',
    fontWeight: 700,
    borderRadius: 10,
    padding: '12px 16px',
    cursor: 'pointer',
    marginRight: 12,
    marginBottom: 12,
  };
  const disabledBtn: React.CSSProperties = {
    ...btn,
    opacity: 0.45,
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
      <h1 style={{ textAlign: 'center', opacity: 0.95, letterSpacing: 1 }}>TRUST OS PoC</h1>

      {/* Connect セクション */}
      <section style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Connect your wallet / ウォレットを接続</h3>

        <div>
          <button
            style={hasInjected ? btn : disabledBtn}
            disabled={!hasInjected}
            onClick={handleInjectedConnect}
          >
            Connect Injected
          </button>

          <button style={btn} onClick={handleWalletConnect}>
            Connect WalletConnect
          </button>

          <button
            style={hasInjected ? btn : disabledBtn}
            disabled={!hasInjected}
            onClick={handleInjectedConnect}
            title="MetaMask は Injected ウォレットなので Injected を押してください"
          >
            Connect MetaMask
          </button>
        </div>

        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
          {isConnected ? (
            <span>
              Connected: <strong>{shortAddress(address)}</strong>
            </span>
          ) : (
            <span>Account status: disconnected</span>
          )}
        </div>

        {(info || !hasInjected) && (
          <div style={{ color: !hasInjected ? '#ff6b6b' : '#ffd27f', marginTop: 10, fontSize: 13 }}>
            {hasInjected ? info || '' : 'No injected wallet detected. Install MetaMask or use WalletConnect.'}
          </div>
        )}
      </section>

      {/* AI スコア */}
      <section style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>AI Analysis → Trust Score</h3>

        <button style={aiState === 'loading' ? disabledBtn : btn} disabled={aiState === 'loading'} onClick={handleGenerateScore}>
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
