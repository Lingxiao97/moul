'use client';

import Link from 'next/link';
import { Server, BookOpen, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            统一管理平台
          </h1>
          <p className="text-xl text-gray-600">
            集成购物商店、MCP服务器管理和知识库管理的综合平台
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* 购物商店卡片 */}
          <Link
            href="/shop"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6 group-hover:bg-purple-200 transition-colors">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              购物商店
            </h2>
            <p className="text-gray-600 mb-6">
              浏览和购买商品，管理购物车，完成订单。
              享受便捷的在线购物体验。
            </p>
            <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
              <span>进入商店</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          {/* MCP管理卡片 */}
          <Link
            href="/mcp"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 group-hover:bg-blue-200 transition-colors">
              <Server className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              MCP服务器管理
            </h2>
            <p className="text-gray-600 mb-6">
              管理和配置MCP服务器，包括HTTP、WebSocket、STDIN、STDIO等类型的服务器。
              支持启用/禁用、状态监控和配置管理。
            </p>
            <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
              <span>进入管理</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 知识库管理卡片 */}
          <Link
            href="/knowledge"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              知识库管理
            </h2>
            <p className="text-gray-600 mb-6">
              管理知识条目，支持分类、标签、搜索等功能。
              创建、编辑、删除知识内容，构建您的知识体系。
            </p>
            <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
              <span>进入管理</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              平台特性
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <div className="font-semibold text-gray-900 mb-2">统一管理</div>
                <div>在一个平台管理所有服务</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-2">易于使用</div>
                <div>直观的界面和操作流程</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-2">功能完整</div>
                <div>覆盖购物、配置、监控、管理等全流程</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
