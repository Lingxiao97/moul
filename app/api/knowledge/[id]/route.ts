import { NextRequest, NextResponse } from 'next/server';
import { knowledgeDB } from '@/lib/db';

// GET - 获取单个知识条目
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const item = knowledgeDB.getById(id);

    if (!item) {
      return NextResponse.json(
        { success: false, error: '知识条目不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取知识条目失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新知识条目
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const item = knowledgeDB.update(id, body);

    if (!item) {
      return NextResponse.json(
        { success: false, error: '知识条目不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新知识条目失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除知识条目
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const success = knowledgeDB.delete(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '知识条目不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '删除知识条目失败' },
      { status: 500 }
    );
  }
}
