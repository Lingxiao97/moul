import { NextRequest, NextResponse } from 'next/server';
import { mcpDB } from '@/lib/db';

export async function GET(
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

    const server = mcpDB.getById(id);
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'MCP服务器不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: server });
  } catch (error) {
    console.error('获取MCP服务器失败:', error);
    return NextResponse.json(
      { success: false, error: '获取MCP服务器失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { name, description, server_type, config, status, enabled } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (server_type !== undefined) updateData.server_type = server_type;
    if (config !== undefined) {
      updateData.config = typeof config === 'string' ? config : JSON.stringify(config);
    }
    if (status !== undefined) updateData.status = status;
    if (enabled !== undefined) updateData.enabled = enabled;

    const server = mcpDB.update(id, updateData);
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'MCP服务器不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: server });
  } catch (error) {
    console.error('更新MCP服务器失败:', error);
    return NextResponse.json(
      { success: false, error: '更新MCP服务器失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const success = mcpDB.delete(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'MCP服务器不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除MCP服务器失败:', error);
    return NextResponse.json(
      { success: false, error: '删除MCP服务器失败' },
      { status: 500 }
    );
  }
}
