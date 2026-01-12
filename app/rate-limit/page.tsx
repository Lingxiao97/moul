'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, Activity, Users, Shield, Clock } from 'lucide-react';

interface TopRequester {
  identifier: string;
  total: number;
  blocked: number;
  allowed: number;
}

interface ViolationPattern {
  identifier: string;
  violations: number;
  hourlyBreakdown: Array<{ hour: number; count: number }>;
}

interface OverallStats {
  totalRequests: number;
  blockedRequests: number;
  uniqueIdentifiers: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
}

interface RateLimitConfig {
  whitelistedIPs: string[];
  defaultLimits: {
    authenticated: { windowMs: number; maxRequests: number };
    anonymous: { windowMs: number; maxRequests: number };
  };
  endpointConfigs: Array<{
    pattern: string;
    authenticated: { windowMs: number; maxRequests: number };
    anonymous: { windowMs: number; maxRequests: number };
  }>;
}

interface DashboardData {
  topRequesters: TopRequester[];
  violationPatterns: ViolationPattern[];
  overallStats: OverallStats;
  config: RateLimitConfig;
  generatedAt: string;
}

export default function RateLimitDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(24);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/rate-limit/stats?hours=${hours}&limit=20`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]);

  const formatIdentifier = (id: string) => {
    if (id.startsWith('ip:')) return id.replace('ip:', 'IP: ');
    if (id.startsWith('user:')) return id.replace('user:', 'User: ');
    if (id.startsWith('token:')) return id.replace('token:', 'Token: ');
    if (id.startsWith('apikey:')) return id.replace('apikey:', 'API Key: ');
    return id;
  };

  const getBlockedPercentage = (blocked: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((blocked / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Rate Limit Dashboard</h1>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (30s)
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={1}>Last 1 hour</option>
                <option value={6}>Last 6 hours</option>
                <option value={24}>Last 24 hours</option>
                <option value={48}>Last 48 hours</option>
              </select>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading && !data ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        ) : data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{data.overallStats.totalRequests.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blocked Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{data.overallStats.blockedRequests.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unique Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{data.overallStats.uniqueIdentifiers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Block Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getBlockedPercentage(data.overallStats.blockedRequests, data.overallStats.totalRequests)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Requesters */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Top Requesters (This Hour)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifier</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Blocked</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Block %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.topRequesters.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No requests recorded yet
                          </td>
                        </tr>
                      ) : (
                        data.topRequesters.map((req, idx) => (
                          <tr key={idx} className={req.blocked > 0 ? 'bg-red-50' : ''}>
                            <td className="px-6 py-4 text-sm text-gray-900 font-mono truncate max-w-xs" title={req.identifier}>
                              {formatIdentifier(req.identifier)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-right">{req.total.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-right">
                              <span className={req.blocked > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                {req.blocked.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right">
                              <span className={getBlockedPercentage(req.blocked, req.total) > 50 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                {getBlockedPercentage(req.blocked, req.total)}%
                              </span>
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
                  <h2 className="text-lg font-semibold text-gray-900">Violation Patterns (Last {hours}h)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifier</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Violations</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pattern</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.violationPatterns.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                            No violations recorded
                          </td>
                        </tr>
                      ) : (
                        data.violationPatterns.slice(0, 10).map((v, idx) => (
                          <tr key={idx} className="bg-red-50">
                            <td className="px-6 py-4 text-sm text-gray-900 font-mono truncate max-w-xs" title={v.identifier}>
                              {formatIdentifier(v.identifier)}
                            </td>
                            <td className="px-6 py-4 text-sm text-red-600 font-medium text-right">
                              {v.violations.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 24 }, (_, i) => {
                                  const hourData = v.hourlyBreakdown.find(h => h.hour === i);
                                  const count = hourData?.count || 0;
                                  const intensity = count === 0 ? 0 : Math.min(count / 10, 1);
                                  return (
                                    <div
                                      key={i}
                                      className="w-2 h-4 rounded-sm"
                                      style={{
                                        backgroundColor: count === 0 ? '#e5e7eb' : `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`,
                                      }}
                                      title={`Hour ${i}: ${count} violations`}
                                    />
                                  );
                                })}
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

            {/* Configuration Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Default Limits */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Rate Limit Configuration</h2>
                </div>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Default Limits</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Authenticated Users</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {data.config.defaultLimits.authenticated.maxRequests} req/min
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Anonymous Users</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {data.config.defaultLimits.anonymous.maxRequests} req/min
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Endpoint-Specific Limits</h3>
                  <div className="space-y-2">
                    {data.config.endpointConfigs.map((cfg, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <code className="text-gray-700">{cfg.pattern}</code>
                        <div className="flex gap-4">
                          <span className="text-green-600">{cfg.authenticated.maxRequests}/min (auth)</span>
                          <span className="text-orange-600">{cfg.anonymous.maxRequests}/min (anon)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Whitelisted IPs */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Whitelisted IPs</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-4">
                    These IP addresses bypass rate limiting entirely.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.config.whitelistedIPs.length === 0 ? (
                      <p className="text-gray-500 text-sm">No IPs whitelisted</p>
                    ) : (
                      data.config.whitelistedIPs.map((ip, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-mono"
                        >
                          {ip}
                        </span>
                      ))
                    )}
                  </div>
                  <p className="mt-4 text-xs text-gray-400">
                    Set RATE_LIMIT_WHITELIST env var to add more IPs (comma-separated)
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <Clock className="inline h-4 w-4 mr-1" />
              Last updated: {new Date(data.generatedAt).toLocaleString()}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
