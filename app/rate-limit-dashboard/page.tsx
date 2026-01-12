'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalRequests: number;
  blockedRequests: number;
  uniqueIdentifiers: number;
}

interface Requester {
  identifier: string;
  total: number;
  blocked: number;
  allowed: number;
}

interface Violation {
  identifier: string;
  violations: number;
  recentPaths: string[];
}

interface DashboardData {
  stats?: Stats;
  topRequesters?: Requester[];
  violations?: Violation[];
}

export default function RateLimitDashboard() {
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/rate-limit?type=all');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rate Limit Dashboard</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Auto-refresh (10s)</span>
            </label>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Requests (This Hour)
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.stats?.totalRequests ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Blocked Requests
            </h3>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {data.stats?.blockedRequests ?? 0}
            </p>
            <p className="text-sm text-gray-500">
              {data.stats?.totalRequests
                ? ((data.stats.blockedRequests / data.stats.totalRequests) * 100).toFixed(1)
                : 0}% block rate
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Unique Clients
            </h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {data.stats?.uniqueIdentifiers ?? 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Requesters */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Requesters</h2>
              <p className="text-sm text-gray-500">Highest request volume this hour</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Identifier
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Allowed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Blocked
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.topRequesters?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    data.topRequesters?.map((requester, index) => (
                      <tr key={requester.identifier} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {requester.identifier.length > 30
                              ? requester.identifier.substring(0, 30) + '...'
                              : requester.identifier}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          {requester.total}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-green-600">
                          {requester.allowed}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-red-600">
                          {requester.blocked}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Violation Patterns */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Violation Patterns</h2>
              <p className="text-sm text-gray-500">Rate limit violations in the last 24 hours</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Identifier
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Violations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Affected Paths
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.violations?.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        No violations recorded
                      </td>
                    </tr>
                  ) : (
                    data.violations?.slice(0, 10).map((violation, index) => (
                      <tr key={violation.identifier} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {violation.identifier.length > 25
                              ? violation.identifier.substring(0, 25) + '...'
                              : violation.identifier}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {violation.violations}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {violation.recentPaths.slice(0, 3).map((path, i) => (
                              <code key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                {path.length > 20 ? path.substring(0, 20) + '...' : path}
                              </code>
                            ))}
                            {violation.recentPaths.length > 3 && (
                              <span className="text-xs text-gray-500">+{violation.recentPaths.length - 3} more</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rate Limit Configuration Info */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rate Limit Configuration</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Default Limits</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Authenticated Users</td>
                      <td className="py-2 text-right font-mono">100 req/min</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Anonymous (IP-based)</td>
                      <td className="py-2 text-right font-mono">30 req/min</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Endpoint-Specific Limits</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">/api/orders</td>
                      <td className="py-2 text-right font-mono">20/5 req/min</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">/api/knowledge</td>
                      <td className="py-2 text-right font-mono">30/10 req/min</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">/api/products</td>
                      <td className="py-2 text-right font-mono">200/100 req/min</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">/api/mcp</td>
                      <td className="py-2 text-right font-mono">50/15 req/min</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">Format: authenticated/anonymous</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
