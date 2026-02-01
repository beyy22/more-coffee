'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface OrderItem {
  id: number;
  product: {
    name: string;
    image_url?: string;
  };
  quantity: number;
  notes?: string;
}

interface Order {
  uuid: string;
  id: number;
  table_number?: string;
  customer_name?: string;
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  items: OrderItem[];
  items_count: number;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Poll for new orders every 15 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      // Fetch orders specifically for KDS (pending, processing, ready)
      const response = await apiRequest<{ data: { data: Order[] } }>('/orders?kds=true&per_page=50');
      
      // Sort: Oldest first (FIFO - First In First Out)
      // Check if response.data is paginated (has .data property) or direct array
      const ordersData = Array.isArray(response.data) ? response.data : response.data.data;
      
      const sortedOrders = ordersData.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Failed to fetch kitchen orders', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (uuid: string, newStatus: string) => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(o => 
        o.uuid === uuid ? { ...o, status: newStatus as any } : o
      ).filter(o => newStatus !== 'completed' || o.uuid !== uuid)); // Remove if completed

      await apiRequest(`/orders/${uuid}/status`, {
        method: 'PUT',
        body: { status: newStatus }
      });
      
      // Re-fetch to ensure sync
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
      fetchOrders(); // Revert on error
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'processing': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'ready': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getTimerColor = (createdAt: string) => {
    const diffInMinutes = (new Date().getTime() - new Date(createdAt).getTime()) / 60000;
    if (diffInMinutes > 15) return 'text-red-600 animate-pulse font-bold';
    if (diffInMinutes > 10) return 'text-orange-500 font-bold';
    return 'text-gray-500';
  };

  // Component to render time elapsed
  const TimeElapsed = ({ startDate }: { startDate: string }) => {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
      const updateTime = () => {
        const diff = new Date().getTime() - new Date(startDate).getTime();
        const minutes = Math.floor(diff / 60000);
        setElapsed(`${minutes} min`);
      };
      updateTime();
      const i = setInterval(updateTime, 60000);
      return () => clearInterval(i);
    }, [startDate]);

    return <span className={getTimerColor(startDate)}>{elapsed}</span>;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kitchen Display System</h1>
          <p className="text-gray-500 text-sm">Real-time orders management</p>
        </div>
        <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full ${refreshing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {refreshing ? 'Refreshing...' : 'Auto-refresh on'}
            </span>
            <button 
            onClick={() => fetchOrders()} 
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
            <span className="material-icons text-gray-600">refresh</span>
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <span className="material-icons text-6xl mb-4">check_circle_outline</span>
          <p className="text-xl font-medium">All caught up!</p>
          <p className="text-sm">No active orders in the kitchen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-10">
          {orders.map(order => (
            <div 
              key={order.uuid} 
              className={`flex flex-col rounded-xl border-2 shadow-sm overflow-hidden bg-white transition-all ${
                order.status === 'ready' ? 'border-green-500 ring-2 ring-green-100' : 
                order.status === 'processing' ? 'border-blue-500' : 
                'border-gray-200'
              }`}
            >
              {/* Card Header */}
              <div className={`px-4 py-3 border-b flex justify-between items-start ${
                  order.status === 'ready' ? 'bg-green-50' : 
                  order.status === 'processing' ? 'bg-blue-50' : 
                  'bg-gray-50'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-lg">#{order.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <span className="material-icons text-sm">table_restaurant</span>
                    <span>Table {order.table_number || 'Takeaway'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                    <TimeElapsed startDate={order.created_at} />
                    <span className="text-[10px] text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
                <ul className="space-y-3">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-600 border border-gray-200">
                        {item.quantity}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{item.product.name}</p>
                        {item.notes && (
                            <p className="text-xs text-red-500 italic mt-0.5">Note: {item.notes}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
                {order.status === 'pending' && (
                    <button 
                        onClick={() => updateStatus(order.uuid, 'processing')}
                        className="col-span-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-icons text-sm">soup_kitchen</span>
                        Start Cooking
                    </button>
                )}
                
                {order.status === 'processing' && (
                    <button 
                        onClick={() => updateStatus(order.uuid, 'ready')}
                        className="col-span-2 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-icons text-sm">room_service</span>
                        Mark Ready
                    </button>
                )}

                {order.status === 'ready' && (
                    <button 
                        onClick={() => updateStatus(order.uuid, 'completed')}
                        className="col-span-2 w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-icons text-sm">check_circle</span>
                        Complete
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
