import { NextRequest, NextResponse } from 'next/server';
import { productDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let products;
    if (category) {
      products = productDB.getByCategory(category);
    } else {
      products = productDB.getAll();
    }

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: '获取商品失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = productDB.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '创建商品失败' }, { status: 500 });
  }
}
