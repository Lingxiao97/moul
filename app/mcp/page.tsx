'use client';

import { useState, useEffect } from 'react';
import MCPList from '@/components/MCPList';
import MCPForm from '@/components/MCPForm';
import { MCPServer } from '@/lib/db';

export default function MCPPage() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // 加载MCP服务器列表
  const loadServers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mcp');
      const result = await response.json();
      if (result.success) {
        setServers(result.data);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const handleCreate = () => {
    setEditingServer(null);
    setShowForm(true);
  };

  const handleEdit = (server: MCPServer) => {
    setEditingServer(server);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个MCP服务器吗？')) return;

    try {
      const response = await fetch(`/api/mcp/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        loadServers();
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const response = await fetch(`/api/mcp/${id}/toggle`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        loadServers();
      } else {
        alert(result.error || '操作失败');
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingServer(null);
    loadServers();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingServer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">MCP服务器管理</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + 新建MCP服务器
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : (
          <MCPList
            servers={servers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        )}

        {showForm && (
          <MCPForm
            server={editingServer}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}
      </main>
    </div>
  );
}
