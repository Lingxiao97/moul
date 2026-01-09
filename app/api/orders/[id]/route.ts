import { NextRequest, NextResponse } from 'next/server';
import { orderDB } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = orderDB.getById(parseInt(params.id));
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const order = orderDB.updateStatus(parseInt(params.id), body.status);
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: '更新订单失败' }, { status: 500 });
  }
}
