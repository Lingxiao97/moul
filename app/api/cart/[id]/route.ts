import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { cartDB } from '@/lib/db';

function getSessionId(): string {
  const cookieStore = cookies();
  let sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const item = cartDB.update(parseInt(params.id), body.quantity);
    return NextResponse.json(item || { success: true });
  } catch (error) {
    return NextResponse.json({ error: '更新购物车商品失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = cartDB.delete(parseInt(params.id));
    if (!success) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除购物车商品失败' }, { status: 500 });
  }
}
