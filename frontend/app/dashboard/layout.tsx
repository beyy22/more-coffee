'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-50">
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
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Header (Mobile specific or Global search could go here) */}
        {/* For now, just a spacer or breadcrumb area if needed */}
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Max width container for large screens */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
