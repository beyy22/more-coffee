'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

interface DashboardStats {
  total_products: number;
  low_stock_count: number;
  total_orders: number;
  total_revenue: number;
  recent_orders: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiRequest<{ data: DashboardStats }>('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-500">Total Revenue</span>
              <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold">All Time</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900">
            Rp {Number(stats?.total_revenue || 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
           <span className="text-sm font-medium text-gray-500">Total Orders</span>
           <span className="text-4xl font-extrabold text-gray-900">
             {stats?.total_orders || 0}
           </span>
           <Link href="/dashboard/orders" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 mt-auto">
             View History <span className="material-icons text-sm">arrow_forward</span>
           </Link>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <span className="text-sm font-medium text-gray-500">Total Products</span>
          <span className="text-4xl font-extrabold text-gray-900">
            {stats?.total_products || 0}
          </span>
          <Link href="/dashboard/products" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 mt-auto">
            Manage Inventory <span className="material-icons text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* Low Stock Alert */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between h-40 ${
             (stats?.low_stock_count ?? 0) > 0 ? 'border-red-200 bg-red-50' : 'border-gray-100'
        }`}>
          <span className={`text-sm font-medium ${(stats?.low_stock_count ?? 0) > 0 ? 'text-red-700' : 'text-gray-500'}`}>Low Stock Alert</span>
          <span className={`text-4xl font-extrabold ${(stats?.low_stock_count ?? 0) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {stats?.low_stock_count || 0}
          </span>
          <span className={`text-sm ${(stats?.low_stock_count ?? 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            Items need restock
          </span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <Link href="/dashboard/pos" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                + New Order
            </Link>
        </div>
        
        {stats?.recent_orders && stats.recent_orders.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {stats.recent_orders.map((order) => (
                        <tr key={order.uuid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">#{order.uuid.substring(0, 8)}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.customer_name || 'Guest'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                Rp {Number(order.total_amount).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="p-8 text-center text-gray-400">
                <span className="material-icons text-4xl mb-2">receipt_long</span>
                <p>No orders found yet.</p>
            </div>
        )}
      </div>
    </div>
  );
}
