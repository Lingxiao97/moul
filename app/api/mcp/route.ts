import { NextRequest, NextResponse } from 'next/server';
import { mcpDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const servers = mcpDB.getAll();
    return NextResponse.json({ success: true, data: servers });
  } catch (error) {
    console.error('获取MCP服务器列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取MCP服务器列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, server_type, config, status, enabled } = body;

    if (!name || !server_type || !config) {
      return NextResponse.json(
        { success: false, error: '名称、服务器类型和配置为必填项' },
        { status: 400 }
      );
    }

    const server = mcpDB.create({
      name,
      description,
      server_type,
      config: typeof config === 'string' ? config : JSON.stringify(config),
      status,
      enabled,
    });

    return NextResponse.json({ success: true, data: server });
  } catch (error) {
    console.error('创建MCP服务器失败:', error);
    return NextResponse.json(
      { success: false, error: '创建MCP服务器失败' },
      { status: 500 }
    );
  }
}
