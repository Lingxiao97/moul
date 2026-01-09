import { NextRequest, NextResponse } from 'next/server';
import { mcpDB } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的ID' },
        { status: 400 }
      );
    }

    const server = mcpDB.toggleEnabled(id);
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'MCP服务器不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: server });
  } catch (error) {
    console.error('切换MCP服务器状态失败:', error);
    return NextResponse.json(
      { success: false, error: '切换MCP服务器状态失败' },
      { status: 500 }
    );
  }
}
