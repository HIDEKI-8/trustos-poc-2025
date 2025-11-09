'use client'

import React from 'react'
import { injected } from 'wagmi/connectors'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
} from 'wagmi'

export default function Home() {
  // Wallet接続系
  const { connect, isPending } = useConnect({ connector: injected() })
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { signMessageAsync, isPending: isSigning } = useSignMessage()

  // デモ用のProposal ID（本番では動的化）
  const proposalId = 'demo-proposal-001'

  // ---- DAO Approve 処理 ----
  async function handleApprove() {
    try {
      if (!isConnected || !address)
        throw new Error('Wallet not connected')

      // 署名するメッセージ（提案IDと時刻を含める）
      const message = `I approve proposal #${proposalId} at ${new Date().toISOString()}`

      // MetaMask署名
      const signature = await signMessageAsync({ message })

      // API（route.ts）へ送信
      const res = await fetch('/api/dao/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, proposalId, message, signature }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data?.error ?? 'Approve failed')

      alert('Approved ✅')
    } catch (err: any) {
      alert(`Approve error: ${err.message ?? String(err)}`)
    }
  }

  // ---- UI ----
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #141421 100%)',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 16 }}>
        TrustOS PoC
      </h1>

      {/* Wallet接続 */}
      {!isConnected ? (
        <button
          onClick={() => connect()}
          disabled={isPending}
          style={{
            background: '#4b6bfb',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {isPending ? 'Connecting...' : 'Connect Wallet (Injected)'}
        </button>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <strong>Connected:</strong> {address}
          </div>
          <button
            onClick={() => disconnect()}
            style={{
              background: 'transparent',
              border: '1px solid #888',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        </>
      )}

      <div style={{ marginTop: 20, opacity: 0.8 }}>
        Account status: {isConnected ? 'connected' : 'disconnected'}
      </div>

      <hr style={{ margin: '24px 0', borderColor: '#333' }} />

      {/* DAO Approve セクション */}
      <section>
        <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
          DAO Approval
        </h3>
        <p style={{ opacity: 0.8, marginBottom: 12 }}>
          Proposal ID: <code>{proposalId}</code>
        </p>
        <button
          onClick={handleApprove}
          disabled={!isConnected || isSigning}
          style={{
            background: '#1db954',
            border: 'none',
            color: '#fff',
            fontSize: 16,
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          {isSigning ? 'Signing...' : 'Approve proposal (sign & send)'}
        </button>
      </section>

      <footer style={{ marginTop: 60, fontSize: 12, opacity: 0.5 }}>
        Version: DAO API Proof — wagmi@2.22.1
      </footer>
    </main>
  )
}
