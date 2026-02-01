'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';

import Script from 'next/script';

declare global {
  interface Window {
    snap: any;
  }
}

interface Product {
  id: number;
  uuid: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  category: { name: string };
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  /* 
    QUICK CONFIG: 
    Set to true to use your static QRIS image and manual verification.
    Set to false to use Midtrans Automatic Payment Gateway.
  */
  const USE_MANUAL_QRIS = false; 

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const [showMobileCart, setShowMobileCart] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiRequest<{ data: any }>('/products?all=true'); // Assuming all=true returns everything or paginate
      // Normalize data
      const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProducts(list);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.uuid === product.uuid);
      if (existing) {
        // Check stock
        if (existing.quantity + 1 > product.stock) {
            alert(`Not enough stock for ${product.name}`);
            return prev;
        }
        return prev.map(item => 
          item.product.uuid === product.uuid 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (uuid: string, delta: number) => {
    setCart(prev => {
        return prev.map(item => {
            if (item.product.uuid === uuid) {
                const newQty = item.quantity + delta;
                if (newQty < 1) return item; // Don't remove directly, or maybe yes? let's stick to min 1 or remove button
                // Check stock
                if (newQty > item.product.stock) {
                    alert('Max stock reached');
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        });
    });
  };

  const removeFromCart = (uuid: string) => {
    setCart(prev => prev.filter(item => item.product.uuid !== uuid));
  };

  const initiateCheckout = () => {
      if (cart.length === 0) return;
      
      if (paymentMethod === 'qris') {
          if (USE_MANUAL_QRIS) {
              setShowQRModal(true);
          } else {
              processOrder(); // Midtrans flow
          }
      } else {
          if (confirm('Process Cash Order?')) {
              processOrder();
          }
      }
  };

  const processOrder = async (isManualConfirmation = false) => {
    setCheckoutLoading(true);
    try {
        const payload = {
            payment_method: paymentMethod, 
            is_manual_payment: isManualConfirmation, // Flag for backend to bypass Midtrans
            items: cart.map(item => ({
                product_uuid: item.product.uuid,
                quantity: item.quantity
            }))
        };

        const response = await apiRequest<{ data: { uuid: string, snap_token?: string } }>('/orders', {
            method: 'POST',
            body: payload
        });

        if (paymentMethod === 'qris' && !isManualConfirmation && response.data.snap_token) {
            // Midtrans Flow
            window.snap.pay(response.data.snap_token, {
                onSuccess: function(result: any){
                    setCart([]);
                    router.push(`/dashboard/orders/${response.data.uuid}`);
                },
                onPending: function(result: any){
                    setCart([]);
                    router.push(`/dashboard/orders/${response.data.uuid}`);
                },
                onError: function(result: any){
                    alert("Payment failed!");
                },
                onClose: function(){
                    alert('You closed the popup without finishing the payment');
                }
            });
            setCheckoutLoading(false); 
        } else {
            // Cash or Manual QRIS Flow
            setCart([]);
            setShowQRModal(false);
            router.push(`/dashboard/orders/${response.data.uuid}`);
        }

    } catch (error: any) {
        alert(error.message || 'Checkout failed');
        setCheckoutLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) && p.stock > 0
  );

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">Loading POS...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-6rem)] relative pb-24 lg:pb-0">
      {/* Left: Product Grid */}
      <div className="w-full lg:flex-1 flex flex-col min-h-0">
        <div className="mb-4 sticky top-0 z-10 lg:static">
             <div className="bg-gray-100/90 backdrop-blur-md p-2 -m-2 mb-0 rounded-b-xl border border-gray-200 lg:bg-transparent lg:p-0 lg:m-0 lg:backdrop-blur-none lg:border-none lg:rounded-none">
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-1 lg:overflow-y-auto">
            {filteredProducts.map(product => (
                <div 
                    key={product.uuid} 
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all flex flex-col group active:scale-95"
                    onClick={() => addToCart(product)}
                >
                    <div 
                        className="h-28 rounded-lg bg-gray-100 mb-3 bg-center bg-cover"
                        style={{ 
                            backgroundImage: product.image_url ? `url(${product.image_url})` : undefined 
                        }} 
                    />
                    <div className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">{product.name}</div>
                    <div className="text-xs text-gray-500 mb-auto">{product.category?.name}</div>
                    
                    <div className="mt-3 flex justify-between items-end border-t pt-3 border-gray-50">
                        <div className="font-bold text-green-700">
                             Rp {Number(product.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                             product.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                            Stock: {product.stock}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Right: Cart Summary (Desktop: Sidebar, Mobile: Bottom Sheet) */}
      <div className={`
          fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out lg:transform-none lg:static lg:w-[380px] lg:border lg:rounded-2xl lg:shadow-sm lg:h-full lg:flex lg:flex-col lg:z-0
          ${showMobileCart ? 'translate-y-0 h-[85vh] rounded-t-3xl' : 'translate-y-0 h-auto'}
      `}>
        {/* Mobile Drag Handle / Header */}
        <div 
            className={`flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 lg:p-5 lg:bg-gray-50/50 cursor-pointer lg:cursor-default ${!showMobileCart ? 'hidden lg:flex' : 'flex'}`}
            onClick={() => setShowMobileCart(!showMobileCart)}
        >
            <div className="flex items-center gap-3">
                <div className="lg:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto absolute top-2 left-0 right-0" />
                <h2 className="text-lg font-bold text-gray-900 mt-2 lg:mt-0">Current Order</h2>
                <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">{totalItems} Items</span>
            </div>
            <div className="lg:hidden">
                <span className="material-icons text-gray-400">keyboard_arrow_down</span>
            </div>
        </div>
        
        {/* Cart Items List */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 bg-white ${!showMobileCart ? 'hidden lg:block' : ''}`}>
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[200px]">
                    <span className="material-icons text-4xl mb-2">shopping_cart_checkout</span>
                    <p>Cart is empty</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.product.uuid} className="flex gap-3 items-center group bg-white">
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{item.product.name}</div>
                            <div className="text-xs text-gray-500">
                                @ {Number(item.product.price).toLocaleString('id-ID')}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                             <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.uuid, -1); }} 
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 active:scale-95"
                             >-</button>
                             <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                             <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.uuid, 1); }} 
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 active:scale-95"
                             >+</button>
                        </div>
                        <div className="font-bold text-sm min-w-[70px] text-right">
                            {Number(item.product.price * item.quantity).toLocaleString('id-ID')}
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); removeFromCart(item.product.uuid); }} 
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <span className="material-icons text-base">close</span>
                        </button>
                    </div>
                ))
            )}
        </div>

        {/* Bottom Total & Checkout */}
        <div className={`p-4 border-t border-gray-100 bg-gray-50/50 lg:bg-gray-50/30 safe-area-bottom lg:p-5 ${!showMobileCart ? 'bg-white border-t-0 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]' : ''}`}>
            <div className={`flex justify-between items-center mb-4 ${!showMobileCart ? 'hidden lg:flex' : ''}`}>
                <span className="text-lg font-medium text-gray-500">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                    Rp {totalAmount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
            </div>

            <div className={`space-y-3 ${!showMobileCart ? 'hidden lg:block' : ''}`}>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${
                            paymentMethod === 'cash' 
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <span className="material-icons text-sm">payments</span> Cash
                    </button>
                    <button 
                        onClick={() => setPaymentMethod('qris')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${
                            paymentMethod === 'qris' 
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <span className="material-icons text-sm">qr_code_scanner</span> QRIS
                    </button>
                </div>
            </div>
            
            <button 
                onClick={(e) => {
                    if (!showMobileCart && window.innerWidth < 1024) {
                        setShowMobileCart(true);
                    } else {
                        initiateCheckout();
                    }
                }}
                disabled={cart.length === 0 || checkoutLoading}
                className={`w-full bg-orange-600 text-white font-bold hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20 flex justify-between items-center
                    ${showMobileCart ? 'py-4 rounded-xl text-lg px-6 mt-3' : 'py-3 px-4 rounded-lg text-base'}
                `}
            >
                <div className="flex items-center gap-2">
                    <span className={`bg-white/20 px-2 py-0.5 rounded text-sm ${showMobileCart ? 'lg:hidden' : ''}`}>{totalItems} items</span>
                    <span className={`lg:hidden ${!showMobileCart ? 'text-white/90 font-normal ml-1' : 'hidden'}`}> | </span>
                    <span className="lg:hidden">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
                
                <span className="flex items-center gap-1">
                    {checkoutLoading ? 'Processing...' : (showMobileCart || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'Complete Order' : 'Review Order')}
                    {!showMobileCart && <span className="material-icons text-sm">keyboard_arrow_up</span>}
                </span>
            </button>
        </div>
      </div>

      {/* Manual QRIS Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Scan QRIS Payment</h2>
                
                <div className="bg-gray-50 p-4 rounded-xl inline-block mb-4 border border-gray-100">
                     <img 
                        src="/qris_static.jpg"
                        alt="Merchant QRIS" 
                        className="w-48 h-auto object-contain mx-auto"
                    />
                </div>
                
                <div className="text-2xl font-bold text-gray-900 mb-2">
                    Rp {totalAmount.toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-gray-500 mb-6">
                    Please scan the QR code above to complete payment
                </p>
                
                <div className="space-y-3">
                    <button 
                        onClick={() => processOrder(true)} 
                        disabled={checkoutLoading}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                    >
                        {checkoutLoading ? 'Verifying...' : 'Payment Confirmed'}
                    </button>
                    <button 
                        onClick={() => setShowQRModal(false)}
                        disabled={checkoutLoading}
                        className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

      <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.midtrans.com/snap/snap.js"}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="lazyOnload"
      />
    </div>
  );
}
