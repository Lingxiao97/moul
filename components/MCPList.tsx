'use client';

import { MCPServer } from '@/lib/db';
import { format } from 'date-fns';
import { Edit, Trash2, Server, Power, PowerOff } from 'lucide-react';

interface MCPListProps {
  servers: MCPServer[];
  onEdit: (server: MCPServer) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export default function MCPList({ servers, onEdit, onDelete, onToggle }: MCPListProps) {
  if (servers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Server className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">暂无MCP服务器</h3>
        <p className="mt-2 text-sm text-gray-500">点击"新建MCP服务器"按钮开始创建</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {servers.map((server) => {
        let configObj;
        try {
          configObj = JSON.parse(server.config);
        } catch {
          configObj = {};
        }

        return (
          <div
            key={server.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {server.name}
                  </h3>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      server.enabled === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {server.enabled === 1 ? '已启用' : '已禁用'}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      server.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {server.status === 'active' ? '运行中' : '未运行'}
                  </span>
                </div>
                {server.description && (
                  <p className="text-gray-600 mb-4">{server.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    类型: {server.server_type}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">配置信息:</p>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(configObj, null, 2)}
                  </pre>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {server.created_at && (
                    <span>
                      创建: {format(new Date(server.created_at), 'yyyy-MM-dd HH:mm')}
                    </span>
                  )}
                  {server.updated_at && (
                    <span>
                      更新: {format(new Date(server.updated_at), 'yyyy-MM-dd HH:mm')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => server.id && onToggle(server.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    server.enabled === 1
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title={server.enabled === 1 ? '禁用' : '启用'}
                >
                  {server.enabled === 1 ? (
                    <Power className="h-5 w-5" />
                  ) : (
                    <PowerOff className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => onEdit(server)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => server.id && onDelete(server.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
