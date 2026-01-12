'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Server, BookOpen, Home, ShoppingBag, Shield, BarChart3 } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/dashboard', label: '仪表板', icon: BarChart3 },
    { href: '/shop', label: '购物商店', icon: ShoppingBag },
    { href: '/knowledge', label: '知识库管理', icon: BookOpen },
    { href: '/mcp', label: 'MCP管理', icon: Server },
    { href: '/rate-limit', label: 'Rate Limit', icon: Shield },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 mr-8">
              统一管理平台
            </h1>
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname?.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
