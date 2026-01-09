import { NextResponse } from 'next/server';
import { knowledgeDB } from '@/lib/db';

// GET - 获取所有分类
export async function GET() {
  try {
    const categories = knowledgeDB.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取分类失败' },
      { status: 500 }
    );
  }
}
