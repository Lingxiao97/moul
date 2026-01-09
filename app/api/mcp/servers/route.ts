import { NextResponse } from 'next/server'

// MCP 服务器配置信息
// 在实际应用中，这些信息可能来自配置文件或环境变量
const MCP_SERVERS = [
  {
    name: 'cursor-browser-extension',
    description: 'Cursor 浏览器扩展 MCP 服务器，用于前端/Web 应用开发',
  },
  {
    name: 'cursor-ide-browser',
    description: 'Cursor IDE 浏览器 MCP 服务器，用于前端/Web 应用开发',
  },
]

export async function GET() {
  try {
    // 注意：在 Next.js API 路由中，我们无法直接调用 MCP 工具
    // 实际的 MCP 资源获取需要在客户端或通过其他机制完成
    // 这里我们返回服务器配置信息，资源列表需要通过客户端工具调用获取
    
    // 返回服务器列表（资源列表需要客户端通过工具调用获取）
    const servers = MCP_SERVERS.map(server => ({
      name: server.name,
      description: server.description,
      resources: [], // 资源列表需要通过客户端工具调用获取
    }))

    return NextResponse.json({
      servers,
      message: '提示：资源列表需要通过客户端工具调用获取。请在前端使用 MCP 工具来获取实际的资源列表。',
    })
  } catch (error) {
    console.error('获取 MCP 服务器列表失败:', error)
    return NextResponse.json(
      { error: '获取服务器列表失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
