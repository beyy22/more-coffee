'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  uuid: string;
  customer_name?: string;
  table_number?: string;
  total_amount: number;
  payment_method: string;
  status: string;
  items_count: number;
  created_at: string;
  type?: 'dine_in' | 'take_away';
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'dine_in' | 'take_away'>('all');

  useEffect(() => {
    fetchOrders();
  }, [filterType]);

  const fetchOrders = async () => {
    try {
      let url = '/orders?';
      if (filterType !== 'all') url += `&type=${filterType}`;
      
      const response = await apiRequest<{ data: { data: Order[] } }>(url);
      setOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order History</h1>
           <p className="text-sm text-gray-500 mt-1">Manage and view all customer orders</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
           {['all', 'dine_in', 'take_away'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                    filterType === type 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            <span className="material-icons text-4xl mb-2 block text-gray-300">receipt_long</span>
                            No orders found
                        </td>
                    </tr>
                ) : (
                    orders.map(order => (
                    <tr key={order.uuid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="font-medium text-gray-900">
                                {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-xs">
                                {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.customer_name || 'Guest'}</div>
                            <div className="text-xs text-gray-500 capitalize">{order.payment_method}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           {order.type === 'take_away' ? (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                   <span className="material-icons text-[14px]">takeout_dining</span> Take Away
                               </span>
                           ) : (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                   <span className="material-icons text-[14px]">restaurant</span> {order.table_number ? `Table ${order.table_number}` : 'Dine In'}
                               </span>
                           )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.items_count} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            Rp {Number(order.total_amount).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {order.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link 
                                href={`/dashboard/orders/${order.uuid}`}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-orange-600 transition-all"
                            >
                                <span className="material-icons text-lg">chevron_right</span>
                            </Link>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
