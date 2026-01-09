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

export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionId();
    const items = cartDB.getBySession(sessionId);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: '获取购物车失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId();
    const body = await request.json();
    const item = cartDB.add({
      product_id: body.product_id,
      quantity: body.quantity || 1,
      session_id: sessionId,
    });

    const response = NextResponse.json(item, { status: 201 });
    response.cookies.set('session_id', sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30天
      httpOnly: true,
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: '添加商品到购物车失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = getSessionId();
    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get('item_id');

    if (itemId) {
      cartDB.delete(parseInt(itemId));
    } else {
      cartDB.clear(sessionId);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除购物车商品失败' }, { status: 500 });
  }
}
