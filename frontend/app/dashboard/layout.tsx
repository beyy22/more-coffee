'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-400">Loading...</div>;
  }

  // Simple sidebar navigation items
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { name: 'POS', icon: 'point_of_sale', href: '/dashboard/pos' },
    { name: 'Orders', icon: 'receipt_long', href: '/dashboard/orders' },
    { name: 'Products', icon: 'inventory_2', href: '/dashboard/products' },
    { name: 'Categories', icon: 'category', href: '/dashboard/categories' },
    { name: 'Inventory', icon: 'warehouse', href: '/dashboard/inventory' },
    { name: 'Reports', icon: 'bar_chart', href: '/dashboard/reports' },
    { name: 'Kitchen', icon: 'kitchen', href: '/dashboard/kitchen' },
    { name: 'Settings', icon: 'settings', href: '/dashboard/settings' },
  ];

  // State for mobile "More" menu
  const [showMobileMore, setShowMobileMore] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">MORE Admin</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-black text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`material-icons text-[20px] mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center px-3 py-2 border border-gray-200 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {/* Max width container for large screens */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Visible on Mobile Only) */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 px-2 shadow-lg safe-area-bottom">
          
          {/* 1. Home */}
          <Link href="/dashboard" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/dashboard' ? 'text-orange-600' : 'text-gray-400'}`}>
            <span className="material-icons text-2xl">dashboard</span>
            <span className="text-[10px] font-medium mt-1">Home</span>
          </Link>

          {/* 2. POS */}
          <Link href="/dashboard/pos" className={`flex flex-col items-center justify-center w-full h-full ${pathname.includes('/pos') ? 'text-orange-600' : 'text-gray-400'}`}>
            <span className="material-icons text-2xl">point_of_sale</span>
            <span className="text-[10px] font-medium mt-1">POS</span>
          </Link>

          {/* 3. Orders */}
          <Link href="/dashboard/orders" className={`flex flex-col items-center justify-center w-full h-full ${pathname.includes('/orders') ? 'text-orange-600' : 'text-gray-400'}`}>
             <span className="material-icons text-2xl">receipt_long</span>
             <span className="text-[10px] font-medium mt-1">Orders</span>
          </Link>

          {/* 4. Products Group */}
           <Link href="/dashboard/products" className={`flex flex-col items-center justify-center w-full h-full ${pathname.includes('/products') || pathname.includes('/categories') || pathname.includes('/inventory') ? 'text-orange-600' : 'text-gray-400'}`}>
            <span className="material-icons text-2xl">inventory_2</span>
            <span className="text-[10px] font-medium mt-1">Products</span>
          </Link>

          {/* 5. More (Toggle) */}
          <button 
            onClick={() => setShowMobileMore(!showMobileMore)}
            className={`flex flex-col items-center justify-center w-full h-full ${showMobileMore ? 'text-orange-600' : 'text-gray-400'}`}
          >
            <span className="material-icons text-2xl">menu</span>
            <span className="text-[10px] font-medium mt-1">More</span>
          </button>
        </div>

        {/* Mobile "More" Menu Overlay */}
        {showMobileMore && (
           <div className="md:hidden fixed bottom-16 right-0 left-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 rounded-t-2xl p-4 animate-slide-up">
              <div className="grid grid-cols-4 gap-4">
                  <Link href="/dashboard/reports" className="flex flex-col items-center p-3 rounded-lg bg-gray-50 active:bg-gray-100" onClick={() => setShowMobileMore(false)}>
                    <span className="material-icons text-purple-500 mb-2">bar_chart</span>
                    <span className="text-xs font-medium text-gray-700">Laporan</span>
                  </Link>
                  <Link href="/dashboard/kitchen" className="flex flex-col items-center p-3 rounded-lg bg-gray-50 active:bg-gray-100" onClick={() => setShowMobileMore(false)}>
                    <span className="material-icons text-red-500 mb-2">kitchen</span>
                    <span className="text-xs font-medium text-gray-700">Dapur</span>
                  </Link>
                  <Link href="/dashboard/categories" className="flex flex-col items-center p-3 rounded-lg bg-gray-50 active:bg-gray-100" onClick={() => setShowMobileMore(false)}>
                    <span className="material-icons text-blue-500 mb-2">category</span>
                    <span className="text-xs font-medium text-gray-700">Kategori</span>
                  </Link>
                  <Link href="/dashboard/inventory" className="flex flex-col items-center p-3 rounded-lg bg-gray-50 active:bg-gray-100" onClick={() => setShowMobileMore(false)}>
                    <span className="material-icons text-green-500 mb-2">warehouse</span>
                    <span className="text-xs font-medium text-gray-700">Stok</span>
                  </Link>
                  <Link href="/dashboard/settings" className="flex flex-col items-center p-3 rounded-lg bg-gray-50 active:bg-gray-100" onClick={() => setShowMobileMore(false)}>
                    <span className="material-icons text-gray-500 mb-2">settings</span>
                    <span className="text-xs font-medium text-gray-700">Settings</span>
                  </Link>
                   <button onClick={logout} className="flex flex-col items-center p-3 rounded-lg bg-red-50 active:bg-red-100 col-span-1">
                    <span className="material-icons text-red-600 mb-2">logout</span>
                    <span className="text-xs font-medium text-red-700">Keluar</span>
                  </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
