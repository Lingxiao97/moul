import { NextRequest, NextResponse } from 'next/server';
import { knowledgeDB, KnowledgeItem } from '@/lib/db';

// GET - 获取所有知识条目或搜索
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const category = searchParams.get('category');

    let items: KnowledgeItem[];

    if (keyword && category) {
      // 同时有搜索关键词和分类时，先搜索再过滤分类
      const searchedItems = knowledgeDB.search(keyword);
      items = searchedItems.filter(item => item.category === category);
    } else if (keyword) {
      items = knowledgeDB.search(keyword);
    } else if (category) {
      items = knowledgeDB.getByCategory(category);
    } else {
      items = knowledgeDB.getAll();
    }

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取知识条目失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新知识条目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, tags, author } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    const item = knowledgeDB.create({
      title,
      content,
      category,
      tags,
      author,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建知识条目失败' },
      { status: 500 }
    );
  }
}
