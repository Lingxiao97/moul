'use client';

import { useState, useEffect } from 'react';
import { MCPServer } from '@/lib/db';
import { X } from 'lucide-react';

interface MCPFormProps {
  server: MCPServer | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function MCPForm({ server, onSubmit, onCancel }: MCPFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    server_type: 'http',
    config: '{}',
    status: 'inactive',
    enabled: 1,
  });
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name || '',
        description: server.description || '',
        server_type: server.server_type || 'http',
        config: server.config || '{}',
        status: server.status || 'inactive',
        enabled: server.enabled !== undefined ? server.enabled : 1,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        server_type: 'http',
        config: '{}',
        status: 'inactive',
        enabled: 1,
      });
    }
  }, [server]);

  const validateConfig = (configStr: string): boolean => {
    try {
      JSON.parse(configStr);
      setConfigError('');
      return true;
    } catch (error) {
      setConfigError('配置必须是有效的JSON格式');
      return false;
    }
  };

  const handleConfigChange = (value: string) => {
    setFormData({ ...formData, config: value });
    validateConfig(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('名称不能为空');
      return;
    }

    if (!validateConfig(formData.config)) {
      return;
    }

    setLoading(true);
    try {
      const url = server ? `/api/mcp/${server.id}` : '/api/mcp';
      const method = server ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        onSubmit();
      } else {
        alert(result.error || '操作失败');
      }
    } catch (error) {
      alert('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {server ? '编辑MCP服务器' : '新建MCP服务器'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                服务器类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.server_type}
                onChange={(e) => setFormData({ ...formData, server_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="http">HTTP</option>
                <option value="websocket">WebSocket</option>
                <option value="stdin">STDIN</option>
                <option value="stdio">STDIO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="inactive">未运行</option>
                <option value="active">运行中</option>
                <option value="error">错误</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              配置 (JSON格式) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.config}
              onChange={(e) => handleConfigChange(e.target.value)}
              rows={10}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                configError ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {configError && (
              <p className="mt-1 text-sm text-red-600">{configError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              示例: {`{"url": "http://localhost:3000", "apiKey": "your-key"}`}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.enabled === 1}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">启用服务器</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? '保存中...' : server ? '更新' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
