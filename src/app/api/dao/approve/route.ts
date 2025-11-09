// src/app/api/dao/approve/route.ts
import { NextResponse } from 'next/server'
import { verifyMessage } from 'viem'

export async function POST(req: Request) {
  try {
    const { address, proposalId, message, signature } = await req.json()

    if (!address || !proposalId || !message || !signature) {
      return NextResponse.json(
        { ok: false, error: 'Missing fields' },
        { status: 400 },
      )
    }

    // 署名が本当に address のものか検証
    const ok = await verifyMessage({
      address,
      message,
      signature,
    })

    if (!ok) {
      return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 })
    }

    // （必要ならここでDB保存・二重投票チェック・レート制限など）
    // 例:
    // await saveApproval({ address, proposalId, signature, message })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unknown error' },
      { status: 500 },
    )
  }
}

