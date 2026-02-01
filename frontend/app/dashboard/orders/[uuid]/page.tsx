'use client';

import { use, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

interface Product {
    name: string;
}

interface OrderItem {
    id: number;
    product: Product;
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
  created_at: string;
  user?: { name: string };
  items: OrderItem[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
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

  if (loading) return <div>Loading details...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard/orders" style={{ color: 'hsl(var(--muted-foreground))', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Back to Orders
        </Link>
      </div>

      <div className="glass-panel" style={{ borderRadius: '1rem', padding: '2rem', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Invoice #{order.uuid.substring(0, 8)}</h1>
                <div style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>Status</div>
                <div style={{ 
                    color: order.status === 'completed' ? '#166534' : '#991b1b',
                    background: order.status === 'completed' ? '#dcfce7' : '#fee2e2',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    display: 'inline-block',
                    marginTop: '0.25rem'
                }}>
                    {order.status}
                </div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Customer</div>
                <div style={{ fontWeight: '500' }}>{order.customer_name || 'Guest'}</div>
                {order.table_number && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--accent))', fontWeight: 'bold' }}>
                        Table: {order.table_number}
                    </div>
                )}
            </div>
            <div>
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Payment Method</div>
                <div style={{ fontWeight: '500', textTransform: 'capitalize' }}>{order.payment_method}</div>
            </div>
            <div>
                 <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Cashier</div>
                 <div style={{ fontWeight: '500' }}>{order.user?.name || '-'}</div>
            </div>
        </div>

        <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0', color: 'hsl(var(--muted-foreground))' }}>Item</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 0', color: 'hsl(var(--muted-foreground))' }}>Price</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 0', color: 'hsl(var(--muted-foreground))' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 0', color: 'hsl(var(--muted-foreground))' }}>Total</th>
                </tr>
            </thead>
            <tbody>
                {order.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0', fontWeight: '500' }}>{item.product?.name || 'Deleted Product'}</td>
                        <td style={{ padding: '1rem 0', textAlign: 'right' }}>{Number(item.price).toLocaleString('id-ID')}</td>
                        <td style={{ padding: '1rem 0', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 'bold' }}>{Number(item.total).toLocaleString('id-ID')}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Total</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'hsl(var(--primary-foreground))' }}>
                        Rp {Number(order.total_amount).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>
            </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-primary" onClick={() => window.print()}>Print Invoice</button>
        </div>
      </div>
    </div>
  );
}
