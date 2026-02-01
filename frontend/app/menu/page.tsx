'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import ProductDetailModal from '@/components/menu/product-detail-modal';
import SkeletonCard from '@/components/ui/skeleton-card';

interface Product {
  uuid: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: { name: string };
  is_active: boolean;
  stock: number;
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>([]);
  const { addToCart, totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch All Products for Menu
        const productsResponse = await apiRequest<{ data: Product[] }>('/products?paginate=false');
        const activeProducts = productsResponse.data.filter(p => p.is_active || p.is_active === undefined);
        setProducts(activeProducts);
        
        // Fetch Real-Time Best Sellers
        try {
            const bestSellerResponse = await apiRequest<{ data: Product[] }>('/products?paginate=false&sort=best_seller');
            // Taken top 5 from the sorted list
            setBestSellers(bestSellerResponse.data.slice(0, 5));
        } catch (e) {
            console.error('Failed to fetch best sellers', e);
        }

        // Extract unique categories (Stable Logic)
        const rawCats = activeProducts.map(p => p.category?.name ? p.category.name.trim() : 'Other');
        const cats = ['All', ...new Set(rawCats)];
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter logic: Category + Search
  const filteredProducts = products.filter(p => {
    const productCategory = p.category?.name ? p.category.name.trim() : 'Other';
    const matchesCategory = selectedCategory === 'All' || productCategory === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  console.log('Filtering:', { selectedCategory, total: products.length, filtered: filteredProducts.length });

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Hero Section with Brand & Animation */}
      <motion.div 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="bg-white relative overflow-hidden"
      >
         {/* Background Image */}
         <div className="absolute inset-0 z-0">
             <img src="/header-bg.png" alt="Background" className="w-full h-full object-cover opacity-30" />
             <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white/90"></div>
         </div>
         
         <div className="max-w-md mx-auto px-6 pt-10 pb-8 relative z-10 text-center">
            <motion.div 
               whileHover={{ scale: 1.05 }}
               className="w-24 h-24 mx-auto mb-4 relative drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            >
               <img 
                  src="/brand-logo-3d.png" 
                  alt="MORE Coffee Brand" 
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-inner"
               />
               <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
            </motion.div>
            
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 drop-shadow-sm">
               MORE Coffee
            </h1>
            <p className="text-gray-600 text-sm font-medium mb-6 bg-white/60 backdrop-blur-sm inline-block px-4 py-1 rounded-full">
               ☕ Good Coffee, Good Mood • 08:00 - 22:00
            </p>

            {/* Search Bar */}
            <div className="relative shadow-lg ring-1 ring-gray-900/5 rounded-2xl bg-white">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-icons text-orange-500">search</span>
               </div>
               <input 
                  type="text" 
                  placeholder="Cari kopi favoritmu..." 
                  className="block w-full pl-11 pr-4 py-4 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 rounded-2xl"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </motion.div>

      {/* Best Seller Slider (Real-Time) */}
      {bestSellers.length > 0 && (
        <div className="max-w-md mx-auto pt-8 pb-4">
           <h2 className="px-4 text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-icons text-orange-500">local_fire_department</span>
              Best Sellers
           </h2>
           <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 pb-4 snap-x">
              {bestSellers.map(product => (
                 <motion.div 
                    key={product.uuid}
                    onClick={() => setSelectedProduct(product)}
                    className="min-w-[280px] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 snap-center relative group active:scale-95 transition-transform cursor-pointer"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                 >
                    <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                       {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                             <span className="material-icons text-4xl opacity-50">coffee</span>
                          </div>
                       )}
                       <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                          POPULAR
                       </div>
                    </div>
                    
                    <div className="p-4">
                       <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{product.name}</h3>
                       <p className="text-xs text-gray-500 line-clamp-2 h-8 mb-3">{product.description || 'No description'}</p>
                       <div className="flex items-center justify-between">
                          <span className="font-extrabold text-lg text-gray-900">
                             {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                          </span>
                          <button 
                             onClick={() => setSelectedProduct(product)}
                             className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg active:bg-orange-600 transition-colors"
                          >
                             <span className="material-icons text-sm">add</span>
                          </button>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>
        </div>
      )}

      {/* Sticky Category Filter */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-sm transition-all duration-300">
        <div className="max-w-md mx-auto">
          <div className="flex px-6 gap-8 overflow-x-auto hide-scrollbar pb-1 pt-4 snap-x">
            {categories.map(cat => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="relative shrink-0 pb-3 snap-start group"
                whileTap={{ scale: 0.95 }}
              >
                 <span className={`text-[13px] font-bold tracking-wide transition-colors duration-300 ${
                    selectedCategory === cat ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                 }`}>
                    {cat}
                 </span>
                 
                 {/* Active Indicator (Magic Line) */}
                 {selectedCategory === cat && (
                    <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600 rounded-t-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                 )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid with Animation */}
      <main className="max-w-md mx-auto px-4 pt-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
             {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
             ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
               <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="text-center py-20"
               >
                  <span className="material-icons text-4xl text-gray-300 mb-2">search_off</span>
                  <p className="text-gray-500 text-sm">No items match your search.</p>
               </motion.div>
            ) : (
               <motion.div 
                  key={selectedCategory} // Force re-render on category change
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="grid grid-cols-2 gap-4"
               >
                 {filteredProducts.map(product => (
                   <motion.div 
                     key={product.uuid} 
                     onClick={() => setSelectedProduct(product)}
                     variants={itemVariants}
                     layout
                     className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full active:scale-[0.98] cursor-pointer"
                   >
                     {/* Image Area */}
                     <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       {product.image_url ? (
                         <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                           <span className="material-icons text-4xl opacity-50">coffee</span>
                         </div>
                       )}
                       
                       {/* Floating Add Button */}
                       <button 
                         onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                         className="absolute bottom-2 right-2 z-20 w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg active:bg-orange-600 active:text-white transition-all transform hover:scale-110"
                       >
                         <span className="material-icons text-[20px]">add</span>
                       </button>
                     </div>
     
                     {/* Content Area */}
                     <div className="p-3 flex flex-col flex-grow" onClick={() => setSelectedProduct(product)}>
                       <div className="mb-2">
                         <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mb-1">{product.category?.name}</p>
                         <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{product.name}</h3>
                       </div>
                       
                       <div className="mt-auto flex items-end justify-between">
                         <span className="font-extrabold text-gray-900 text-sm">
                           {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                         </span>
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
      
      {/* Floating Checkout Button */}
      {totalItems > 0 && (
        <motion.div 
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="fixed bottom-6 left-0 right-0 px-4 z-30 pointer-events-none"
        >
           <div className="max-w-md mx-auto pointer-events-auto">
              <Link href="/menu/cart" className="bg-gray-900 text-white w-full p-1 pl-4 rounded-[1.25rem] shadow-2xl flex justify-between items-center group active:scale-95 transition-transform">
                <div className="flex flex-col items-start leading-none py-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{totalItems} Items in Cart</span>
                  <span className="font-bold text-lg">Checkout</span>
                </div>
                <div className="bg-white text-gray-900 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-45 transition-transform duration-300">
                    <span className="material-icons">arrow_forward</span>
                </div>
              </Link>
           </div>
        </motion.div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}
