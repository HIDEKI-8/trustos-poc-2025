// src/app/api/dao/approve/route.ts
export async function POST(request: Request) {
  try {
    // 受け取った JSON を安全に取得（存在しなければ空オブジェクト）
    const body = await request.json().catch(() => ({}));
    // ここで本来の処理を追加（DB保存等）。今はモックで受け取った内容を返す
    return new Response(JSON.stringify({ ok: true, received: body }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err ?? 'unknown error') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
