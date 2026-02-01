'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category_id: initialData?.category_id || '',
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    description: initialData?.description || '',
    min_stock: initialData?.min_stock || 5,
    is_available: initialData?.is_available ?? true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    apiRequest<{success: boolean, data: Category[]}>('/categories?all=true')
      .then(res => {
         // Handle both array or paginated response for safety
         const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
         setCategories(list);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrls: string[] = [];
      
      // 1. Upload Image logic (if file selected)
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append('image', imageFile);
        const uploadRes = await apiRequest<{url: string}>('/upload', {
            method: 'POST',
            body: formDataImage
        });
        imageUrls.push(uploadRes.url);
      }

      // 2. Prepare Payload
      const payload = {
        ...formData,
        ...(imageUrls.length > 0 && { images: imageUrls }),
      };

      // 3. Submit Product
      const endpoint = isEdit ? `/products/${initialData.uuid}` : '/products';
      const method = isEdit ? 'PUT' : 'POST';

      await apiRequest(endpoint, { method, body: payload });
      
      router.push('/dashboard/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Product Name</label>
            <input 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="e.g. Arabica Blend"
            />
        </div>
        <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Category</label>
            <select 
                name="category_id" 
                required 
                value={formData.category_id} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all bg-white"
            >
               <option value="">Select Category</option>
               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Price (Rp)</label>
            <input 
                type="number" 
                name="price" 
                required 
                min="0" 
                value={formData.price} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
        </div>
        <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Stock</label>
            <input 
                type="number" 
                name="stock" 
                required 
                min="0" 
                value={formData.stock} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
        </div>
        <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">Min Stock</label>
            <input 
                type="number" 
                name="min_stock" 
                required 
                min="0" 
                value={formData.min_stock} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
        </div>
      </div>

      <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">Description</label>
          <textarea 
              name="description" 
              rows={4} 
              value={formData.description} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
              placeholder="Product description..."
          />
      </div>

      <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">Product Image</label>
          <div className="flex items-center gap-4">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-orange-50 file:text-orange-700
                  hover:file:bg-orange-100 transition-all
                " 
              />
              {initialData?.image_url && <div className="text-xs text-gray-400">Current: {initialData.image_url.split('/').pop()}</div>}
          </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
            type="checkbox" 
            name="is_available" 
            checked={formData.is_available} 
            onChange={handleCheckbox} 
            id="avail" 
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
        />
        <label htmlFor="avail" className="text-sm font-medium text-gray-700 select-none cursor-pointer">Available for Sale</label>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button 
            type="submit" 
            disabled={loading} 
            className="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  );
}
