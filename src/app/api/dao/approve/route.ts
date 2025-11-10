// src/app/api/dao/approve/route.ts
import { NextResponse } from 'next/server';

type DaoVote = {
  yes: number;
  no: number;
  quorum: number;
};

type DaoApproveResponse = {
  approved: boolean;
  txHash: string;
  votes: DaoVote;
};

export async function POST(req: Request) {
  // 使っていないなら一旦受けるだけ
  const _body = await req.json().catch(() => ({}));

  // モックの返却
  const data: DaoApproveResponse = {
    approved: true,
    txHash: '0x' + 'deadbeef'.repeat(8),
    votes: { yes: 42, no: 5, quorum: 30 },
  };

  return NextResponse.json(data);
}
