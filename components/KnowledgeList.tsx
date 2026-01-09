'use client';

import { KnowledgeItem } from '@/lib/db';
import { format } from 'date-fns';
import { Edit, Trash2, FileText } from 'lucide-react';

interface KnowledgeListProps {
  items: KnowledgeItem[];
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (id: number) => void;
}

export default function KnowledgeList({ items, onEdit, onDelete }: KnowledgeListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">暂无知识条目</h3>
        <p className="mt-2 text-sm text-gray-500">点击"新建知识条目"按钮开始创建</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {item.content}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {item.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {item.category}
                  </span>
                )}
                {item.tags && item.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {item.author && (
                  <span>作者: {item.author}</span>
                )}
                {item.created_at && (
                  <span>
                    创建: {format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')}
                  </span>
                )}
                {item.updated_at && (
                  <span>
                    更新: {format(new Date(item.updated_at), 'yyyy-MM-dd HH:mm')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="编辑"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => item.id && onDelete(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
