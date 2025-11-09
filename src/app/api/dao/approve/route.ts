// src/app/api/dao/approve/route.ts
import { NextResponse } from 'next/server';

interface ApproveBody {
  address?: string;
  score: number;
}

interface DaoVotes {
  yes: number;
  no: number;
  quorum: number;
}

interface DaoApproveResponse {
  approved: boolean;
  txHash: string;
  votes: DaoVotes;
}

export async function POST(req: Request) {
  const { address, score } = (await req.json()) as ApproveBody;

  // モック判定（例: 60点以上は承認）
  const approved = typeof score === 'number' ? score >= 60 : false;

  const votes: DaoVotes = {
    yes: approved ? 128 : 49,
    no: approved ? 12 : 73,
    quorum: 100,
  };

  const res: DaoApproveResponse = {
    approved,
    txHash: '0xmock_tx_hash_abcdef1234567890',
    votes,
  };

  return NextResponse.json(res);
}
