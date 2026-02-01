'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Product {
  id: number;
  uuid: string;
  name: string;
  category: { name: string };
  price: number;
  stock: number;
  description?: string;
  image_url?: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchProducts = async (pageNumber: number) => {
    setLoading(true);
    try {
      // The API returns { success: true, data: { current_page: 1, data: [...], ... } }
      const response = await apiRequest<{ data: any }>(`/products?page=${pageNumber}`);
      
      const productData = response.data;
      
      // Check if it's paginated (has data array and current_page)
      if (productData.data && typeof productData.current_page === 'number') {
         setProducts(productData.data);
         setMeta({
             current_page: productData.current_page,
             last_page: productData.last_page,
             total: productData.total,
             per_page: productData.per_page
         });
      } else if (Array.isArray(productData)) {
          // Fallback if API returns flat array
          setProducts(productData);
          setMeta(null);
      } else {
          setProducts([]);
      }
      
    } catch (error) {
       console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
      if (newPage > 0 && (!meta || newPage <= meta.last_page)) {
          setPage(newPage);
      }
  };

  if (loading && products.length === 0) return <div className="flex h-full items-center justify-center text-gray-400">Loading products...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your coffee inventory</p>
        </div>
        <Link 
            href="/dashboard/products/create" 
            className="inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-sm active:scale-95"
        >
          <span className="material-icons text-sm mr-2">add</span>
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.uuid} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden flex flex-col group">
            {product.image_url ? (
                <div 
                    className="aspect-[4/3] w-full bg-gray-100 bg-center bg-cover relative"
                    style={{ backgroundImage: `url(${product.image_url})` }}
                >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
            ) : (
                <div className="aspect-[4/3] w-full bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                    <span className="material-icons text-4xl mb-2">image_not_supported</span>
                    <span className="text-xs font-medium">No Image</span>
                </div>
            )}
            
            <div className="p-5 flex flex-col flex-1">
                <div className="text-[10px] font-bold tracking-wider text-orange-600 uppercase mb-2">
                    {product.category?.name || 'Uncategorized'}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-orange-600 transition-colors">
                    {product.name}
                </h3>
                
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                    {product.description || 'No description available'}
                </p>

                <div className="mt-auto flex items-end justify-between border-t pt-4 border-gray-50">
                    <div>
                        <span className="block text-xs text-gray-400 mb-0.5">Price</span>
                        <span className="text-lg font-bold text-gray-900">
                            Rp {Number(product.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.stock > 10 ? 'bg-green-50 text-green-700' : 
                        product.stock > 0 ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {product.stock} left
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link 
                        href={`/dashboard/products/${product.uuid}/edit`} 
                        className="flex items-center justify-center py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-colors"
                    >
                        Edit
                    </Link>
                    <button 
                        onClick={async () => {
                            if(confirm('Delete this product?')) {
                                await apiRequest(`/products/${product.uuid}`, { method: 'DELETE' });
                                fetchProducts(page);
                            }
                        }}
                        className="flex items-center justify-center py-2 rounded-lg bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {meta && meta.last_page > 1 && (
          <div className="flex justify-center items-center gap-4 pt-4">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                  Page {meta.current_page} of {meta.last_page}
              </span>
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === meta.last_page}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  Next
              </button>
          </div>
      )}
    </div>
  );
}
