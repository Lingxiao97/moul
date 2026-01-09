import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { orderDB, cartDB, productDB } from '@/lib/db';

function getSessionId(): string {
  const cookieStore = cookies();
  return cookieStore.get('session_id')?.value || '';
}

export async function GET(request: NextRequest) {
  try {
    const orders = orderDB.getAll();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId();
    const body = await request.json();

    // 获取购物车商品
    const cartItems = cartDB.getBySession(sessionId);
    if (cartItems.length === 0) {
      return NextResponse.json({ error: '购物车为空' }, { status: 400 });
    }

    // 计算总金额并准备订单项
    let totalAmount = 0;
    const orderItems = cartItems.map((item: any) => {
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
      return {
        product_id: item.product_id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
      };
    });

    // 创建订单
    const order = orderDB.create(
      {
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        customer_address: body.customer_address,
        total_amount: totalAmount,
        status: 'pending',
      },
      orderItems
    );

    // 清空购物车
    cartDB.clear(sessionId);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}
