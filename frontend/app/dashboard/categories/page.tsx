'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

interface Category {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  products_count?: number;
  is_active: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await apiRequest<{ data: any }>('/categories');
      // Normalize pagination vs list
      const list = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      setCategories(list);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (uuid: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await apiRequest(`/categories/${uuid}`, { method: 'DELETE' });
      fetchCategories();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">Loading categories...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organize your menu structure</p>
        </div>
        <Link 
            href="/dashboard/categories/create" 
            className="inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-sm active:scale-95"
        >
          <span className="material-icons text-sm mr-2">add</span>
          Add Category
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {categories.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                <span className="material-icons text-4xl mb-3 text-gray-300">category</span>
                <p>No categories found.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-100">
                {categories.map((category) => (
                    <div key={category.uuid} className="group flex items-center justify-between p-4 hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-lg shrink-0">
                                {category.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">{category.products_count || 0} items</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link 
                                href={`/dashboard/categories/${category.uuid}/edit`}
                                className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                Edit
                            </Link>
                            <button 
                                onClick={() => handleDelete(category.uuid)}
                                className="text-sm font-medium text-red-300 hover:text-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
