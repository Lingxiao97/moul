'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  BookOpen, 
  Server, 
  Package, 
  Users, 
  TrendingUp,
  Activity,
  DollarSign,
  FileText,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalKnowledge: number;
  totalMCP: number;
  totalRevenue: number;
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    time: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalKnowledge: 0,
    totalMCP: 0,
    totalRevenue: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 并行获取所有统计数据
      const [productsRes, ordersRes, knowledgeRes, mcpRes] = await Promise.all([
        fetch('/api/products').catch(() => ({ ok: false })),
        fetch('/api/orders').catch(() => ({ ok: false })),
        fetch('/api/knowledge').catch(() => ({ ok: false })),
        fetch('/api/mcp').catch(() => ({ ok: false })),
      ]);

      let totalProducts = 0;
      let totalOrders = 0;
      let totalRevenue = 0;
      let totalKnowledge = 0;
      let totalMCP = 0;

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        totalProducts = productsData.success ? productsData.data?.length || 0 : 0;
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.data) {
          totalOrders = ordersData.data.length;
          totalRevenue = ordersData.data.reduce((sum: number, order: any) => {
            return sum + (order.total || 0);
          }, 0);
        }
      }

      if (knowledgeRes.ok) {
        const knowledgeData = await knowledgeRes.json();
        totalKnowledge = knowledgeData.success ? knowledgeData.data?.length || 0 : 0;
      }

      if (mcpRes.ok) {
        const mcpData = await mcpRes.json();
        totalMCP = mcpData.success ? mcpData.data?.length || 0 : 0;
      }

      // 生成模拟活动数据
      const recentActivity = [
        { id: 1, type: 'order', description: '新订单已创建', time: '2分钟前' },
        { id: 2, type: 'product', description: '新产品已添加', time: '15分钟前' },
        { id: 3, type: 'knowledge', description: '知识条目已更新', time: '1小时前' },
        { id: 4, type: 'mcp', description: 'MCP服务器已配置', time: '2小时前' },
      ];

      setStats({
        totalProducts,
        totalOrders,
        totalKnowledge,
        totalMCP,
        totalRevenue,
        recentActivity,
      });
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '商品总数',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      title: '订单总数',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: '知识条目',
      value: stats.totalKnowledge,
      icon: BookOpen,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'MCP服务器',
      value: stats.totalMCP,
      icon: Server,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      title: '总收入',
      value: `¥${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            仪表板
          </h1>
          <p className="text-gray-600 mt-2">平台整体数据统计和概览</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 最近活动 */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                最近活动
              </h2>
              <button
                onClick={loadDashboardData}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                刷新
              </button>
            </div>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无活动记录
                </div>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              快速操作
            </h2>
            <div className="space-y-3">
              <a
                href="/shop"
                className="block w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium text-center"
              >
                管理商品
              </a>
              <a
                href="/knowledge"
                className="block w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-center"
              >
                管理知识库
              </a>
              <a
                href="/mcp"
                className="block w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-center"
              >
                管理MCP服务器
              </a>
              <a
                href="/shop/orders"
                className="block w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium text-center"
              >
                查看订单
              </a>
            </div>
          </div>
        </div>

        {/* 数据概览图表区域（预留） */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            数据趋势
          </h2>
          <div className="text-center py-12 text-gray-500">
            <p>图表功能开发中...</p>
            <p className="text-sm mt-2">未来将显示订单趋势、销售统计等可视化数据</p>
          </div>
        </div>
      </div>
    </div>
  );
}
