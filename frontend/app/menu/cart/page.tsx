'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import Script from 'next/script';

declare global {
  interface Window {
    snap: any;
  }
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const router = useRouter();
  
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('qris');
  const [orderType, setOrderType] = useState<'dine_in' | 'take_away'>('dine_in');
  const [loading, setLoading] = useState(false);

  // If cart empty, redirect to menu
  useEffect(() => {
    if (cart.length === 0) {
      // Optional: router.push('/menu');
    }
  }, [cart]);

  const handleCheckout = async () => {
    if (!customerName || (orderType === 'dine_in' && !tableNumber)) {
      alert('Please fill in Name' + (orderType === 'dine_in' ? ' and Table Number' : ''));
      return;
    }

    setLoading(true);
    try {
        const payload = {
            customer_name: customerName,
            type: orderType,
            table_number: orderType === 'dine_in' ? tableNumber : null,
            payment_method: paymentMethod, 
            items: cart.map(item => ({
                product_uuid: item.uuid,
                quantity: item.quantity
            }))
        };

        const response = await apiRequest<{ data: { uuid: string, snap_token?: string } }>('/orders', {
            method: 'POST',
            body: payload
        });

        if (paymentMethod === 'qris' && response.data.snap_token) {
            window.snap.pay(response.data.snap_token, {
                onSuccess: function(result: any){
                    clearCart();
                    router.push(`/menu/orders/${response.data.uuid}`);
                },
                onPending: function(result: any){
                     clearCart();
                     router.push(`/menu/orders/${response.data.uuid}`);
                },
                onError: function(result: any){
                    alert("Payment failed!");
                },
                onClose: function(){
                    // alert('You closed the popup without finishing the payment');
                }
            });
        } else {
            // Cash Order
            clearCart();
            router.push(`/menu/orders/${response.data.uuid}`);
        }
    } catch (error: any) {
        alert(error.message || 'Checkout failed');
    } finally {
        setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
           <span className="material-icons text-3xl">shopping_cart</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 text-center">Looks like you haven't added anything yet.</p>
        <Link href="/menu" className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform">
           Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
       {/* Header */}
       <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
          <Link href="/menu" className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
            <span className="material-icons text-gray-600 text-sm">arrow_back</span>
          </Link>
          <h1 className="font-bold text-lg">My Order</h1>
       </header>

       <main className="max-w-md mx-auto p-4 space-y-6">
          {/* Cart Items */}
          <section className="space-y-4">
             {cart.map(item => (
                <div key={item.uuid} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                   <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="material-icons">coffee</span>
                        </div>
                      )}
                   </div>
                   <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">{item.name}</h3>
                        <p className="text-orange-600 font-bold text-sm">
                           {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.uuid, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600">-</button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.uuid, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600">+</button>
                         </div>
                         <button onClick={() => removeFromCart(item.uuid)} className="text-red-500 text-xs font-bold px-2">Remove</button>
                      </div>
                   </div>
                </div>
             ))}
          </section>

          {/* Customer Info */}
          <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-900 border-b pb-2">Order Details</h3>
              
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Order Type</label>
                 <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setOrderType('dine_in')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${orderType === 'dine_in' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                    >
                        <span className="material-icons">restaurant</span>
                        <span className="text-xs font-bold">Dine In</span>
                    </button>
                    <button
                        onClick={() => setOrderType('take_away')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${orderType === 'take_away' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                    >
                        <span className="material-icons">shopping_bag</span>
                        <span className="text-xs font-bold">Take Away</span>
                    </button>
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Name</label>
                 <input 
                    type="text" 
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Budi"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                 />
              </div>

              {orderType === 'dine_in' && (
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Table Number</label>
                     <select 
                        value={tableNumber}
                        onChange={e => setTableNumber(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                     >
                        <option value="">Select Table</option>
                        {[...Array(20)].map((_, i) => (
                            <option key={i+1} value={String(i+1)}>Table {i+1}</option>
                        ))}
                     </select>
                  </div>
              )}

              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Method</label>
                 <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setPaymentMethod('qris')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'qris' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                    >
                        <span className="material-icons">qr_code_scanner</span>
                        <span className="text-xs font-bold">QRIS</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                    >
                        <span className="material-icons">payments</span>
                        <span className="text-xs font-bold">Cash (Cashier)</span>
                    </button>
                 </div>
              </div>
          </section>

          {/* Summary */}
          <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalAmount)}</span>
             </div>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-gray-500">Tax & Service (0%)</span>
                <span className="font-bold text-green-600">Free</span>
             </div>
             <div className="flex justify-between border-t pt-3 text-lg">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-orange-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalAmount)}</span>
             </div>
          </section>
       </main>

       {/* Bottom Action */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
          <div className="max-w-md mx-auto">
             <button 
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex justify-between px-6 transition-all active:scale-[0.98] ${loading ? 'bg-gray-400' : 'bg-gray-900'}`}
             >
                <span>{loading ? 'Processing...' : (paymentMethod === 'qris' ? 'Pay with QRIS' : 'Place Order')}</span>
                <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalAmount)}</span>
             </button>
          </div>
       </div>

       <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.midtrans.com/snap/snap.js"}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="lazyOnload"
      />
    </div>
  );
}
