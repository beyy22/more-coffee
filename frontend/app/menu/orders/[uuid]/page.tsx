'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

// Helper to unwrap params Promise in Next.js 15+
import { use } from 'react';

interface OrderItem {
  id: number;
  product: {
    name: string;
    image_url?: string;
  };
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  uuid: string;
  customer_name?: string;
  table_number?: string;
  total_amount: number;
  payment_method: string;
  status: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
  snap_token?: string;
}

export default function OrderStatusPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiRequest<{ data: Order }>(`/orders/${uuid}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [uuid]);

  if (loading) return <div className="p-10 text-center">Loading receipt...</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (

    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
       <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Status Header */}
          <div className={`p-8 text-center ${order.payment_method === 'cash' ? 'bg-gray-900' : 'bg-orange-600'} text-white relative overflow-hidden`}>
             <div className="relative z-10">
                 <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons text-4xl text-white">
                        {order.payment_method === 'cash' ? 'storefront' : 'check_circle'}
                    </span>
                 </div>
                 <h1 className="text-2xl font-bold mb-1">
                    {order.payment_method === 'cash' ? 'Pay at Cashier' : 'Payment Success'}
                 </h1>
                 <p className="text-white/80 text-sm">
                    {order.payment_method === 'cash' ? 'Show this screen to staff' : 'Thank you for your order!'}
                 </p>
             </div>
             
             {/* Decor circles */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
             <div className="absolute top-10 -left-10 w-24 h-24 bg-white/10 rounded-full"></div>
          </div>

          {/* Receipt Body */}
          <div className="p-6 relative">
             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Order ID</p>
                   <p className="font-mono font-bold text-gray-900">#{order.uuid.substring(0,8)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Table</p>
                   <p className="font-bold text-2xl text-orange-600 leading-none">{order.table_number || '-'}</p>
                </div>
             </div>

             <div className="space-y-4 mb-6">
                <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Items</p>
                   <div className="space-y-2">
                    {order.items.map(item => (
                       <div key={item.id} className="flex justify-between text-sm py-2 border-b border-dashed border-gray-100 last:border-0">
                          <div className="flex gap-3">
                             <div className="font-bold text-gray-900 w-6 text-center bg-gray-100 rounded text-xs py-1 h-fit">{item.quantity}x</div>
                             <span className="text-gray-700">{item.product.name}</span>
                          </div>
                          <span className="font-medium text-gray-900">
                             {new Intl.NumberFormat('id-ID').format(item.total)}
                          </span>
                       </div>
                    ))}
                   </div>
                </div>
             </div>

             <div className="border-t-2 border-dashed border-gray-100 pt-4 flex justify-between items-end">
                <div>
                    <span className="block text-xs text-gray-400">Total Amount</span>
                    <span className="text-xs text-green-600 font-bold">No Tax & Service</span>
                </div>
                <span className="font-extrabold text-2xl text-gray-900">
                   {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total_amount)}
                </span>
             </div>
          </div>

          {/* Action */}
          <div className="p-6 pt-0">
             <Link href="/menu" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 rounded-xl font-bold text-center transition-colors">
                Order More Items
             </Link>
          </div>
       </div>
       
       <p className="mt-6 text-xs text-gray-400 font-medium">MORE Coffee & Space</p>
    </div>
  );
}
