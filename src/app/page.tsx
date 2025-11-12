// --- 必要な imports は既にある前提 ---
// import React, { useEffect, useRef, useState } from 'react';

/////////////////////
// Ethereum helpers
/////////////////////

// プロンプトを出さずに現在接続済みのアカウントを取得する（ユーザー操作なし）
const getConnectedAccountsSilently = async (): Promise<string[]> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) return [];
    // 'eth_accounts' はユーザーに接続ダイアログを出さずに既存の接続を返す
    const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as unknown;
    if (Array.isArray(accounts)) return accounts.map(String);
    if (typeof accounts === 'string' && accounts.length) return [accounts];
    return [];
  } catch (err) {
    debugLog('getConnectedAccountsSilently error:', err);
    return [];
  }
};

// 実際に接続ダイアログを出してアカウントを要求する（ボタン押下時のみ呼ぶ）
const requestAccountsWithPrompt = async (): Promise<string[]> => {
  if (typeof window === 'undefined' || !window.ethereum) return [];
  // ここで eth_requestAccounts を呼ぶと MetaMask が起動してプロンプトが出る（＝ユーザー操作必須）
  const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as unknown;
  if (Array.isArray(accounts)) return accounts.map(String);
  if (typeof accounts === 'string' && accounts.length) return [accounts];
  return [];
};

/////////////////////
// Home コンポーネント内の useEffect（接続の初期検出 と イベント登録）
// マウント時に一度だけ実行して、プロンプトを出さずに接続状態を確認。
// また accountsChanged を監視して UI を更新します。
useEffect(() => {
  let mounted = true;

  (async () => {
    // プロンプトを出さずに既に接続されているアカウントを取る
    const accounts = await getConnectedAccountsSilently();
    if (!mounted) return;
    if (accounts.length > 0) {
      // 実際に UI を「接続済み」にするのはここだけ
      setIsConnected(true);
      setAddress(accounts[0]);
      setInfo('Detected connected wallet (no prompt).');
      debugLog('Detected connected accounts:', accounts[0]);
    } else {
      // 未接続なら明示的に未接続状態をセット（古い値が残るのを防ぐ）
      setIsConnected(false);
      setAddress(null);
      debugLog('No connected accounts on mount.');
    }
  })();

  // accountsChanged ハンドラ
  const handleAccountsChanged = (accounts: unknown) => {
    debugLog('accountsChanged event:', accounts);
    try {
      if (Array.isArray(accounts) && accounts.length > 0) {
        const a = String(accounts[0]);
        setIsConnected(true);
        setAddress(a);
        setInfo('Account changed / ウォレットが変更されました。');
      } else {
        // 空配列は切断を意味する（MetaMaskで接続解除した等）
        setIsConnected(false);
        setAddress(null);
        setInfo('Disconnected / ウォレットが切断されました。');
      }
    } catch (e) {
      debugLog('accountsChanged handler error', e);
    }
  };

  // chainChanged ハンドラ（必要なら）
  const handleChainChanged = (chainId: string) => {
    debugLog('chainChanged:', chainId);
    // chain が変わったら簡単にページリロードするのが安全（必要なら洗練させてください）
    // window.location.reload();
  };

  // イベント登録（存在する時のみ）
  if (typeof window !== 'undefined' && window.ethereum && window.ethereum.on) {
    window.ethereum.on('accountsChanged', handleAccountsChanged as any);
    window.ethereum.on('chainChanged', handleChainChanged as any);
  }

  return () => {
    mounted = false;
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.removeListener) {
      try {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged as any);
        window.ethereum.removeListener('chainChanged', handleChainChanged as any);
      } catch {
        // ignore
      }
    }
  };
}, []); // マウント時のみ

/////////////////////
// Connect ボタン用ハンドラ（ユーザー操作でのみ呼ぶ）
const connectMetaMask = async (): Promise<void> => {
  setInfo('');
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      setInfo('No injected wallet found. Please install MetaMask or use WalletConnect on mobile.');
      return;
    }

    // ここでのみプロンプトが発生する（ユーザーの明示的な操作時）
    const accounts = await requestAccountsWithPrompt();
    if (accounts.length > 0) {
      setIsConnected(true);
      setAddress(accounts[0]);
      setInfo('Connected to MetaMask');
      debugLog('Connected accounts:', accounts[0]);
    } else {
      setInfo('No accounts returned by wallet.');
    }
  } catch (err: unknown) {
    const m = errToString(err);
    setInfo(m);
    debugLog('connectMetaMask error:', m);
  }
};

// doConnect を使っているなら、injected の場合に上の connectMetaMask を呼ぶようにする
const doConnect = async (kind: 'metaMask' | 'walletConnect' | 'injected') => {
  setInfo('');
  if (kind === 'metaMask' || kind === 'injected') {
    await connectMetaMask();
  } else {
    setInfo('WalletConnect not wired in this minimal build.');
  }
};
