import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const server = searchParams.get('server')
    const uri = searchParams.get('uri')
    const download = searchParams.get('download') === 'true'

    if (!server || !uri) {
      return NextResponse.json(
        { error: '缺少必要参数: server 和 uri' },
        { status: 400 }
      )
    }

    // 这里应该调用 MCP 工具来获取资源
    // 由于我们在服务器端无法直接调用工具，我们返回一个示例响应
    // 实际使用时需要替换为真实的 MCP 资源获取逻辑
    
    // 注意：在实际应用中，你需要通过某种方式连接到 MCP 服务器并获取资源
    // 这可能涉及到建立 WebSocket 连接或其他通信机制
    
    const mockContent = `这是来自服务器 "${server}" 的资源内容示例。
    
URI: ${uri}

在实际应用中，这里会显示从 MCP 服务器获取的真实资源内容。
你需要实现与 MCP 服务器的通信逻辑来获取实际的资源数据。`

    if (download) {
      return new NextResponse(mockContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${uri.split('/').pop() || 'resource'}"`,
        },
      })
    }

    return NextResponse.json({
      content: mockContent,
      server,
      uri,
    })
  } catch (error) {
    console.error('获取 MCP 资源失败:', error)
    return NextResponse.json(
      { error: '获取资源失败' },
      { status: 500 }
    )
  }
}
