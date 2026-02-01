'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

interface CategoryFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        sort_order: initialData.sort_order || 0,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit 
        ? `/categories/${initialData.uuid}` 
        : '/categories';
      
      const method = isEdit ? 'PUT' : 'POST';

      await apiRequest(url, {
        method,
        body: formData
      });

      router.push('/dashboard/categories');
    } catch (error: any) {
      alert(error.message || 'Failed to save category');
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', maxWidth: '600px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="label" htmlFor="name">Category Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className="input-field"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Coffee"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="label" htmlFor="slug">Slug (Optional)</label>
        <input
          type="text"
          id="slug"
          name="slug"
          className="input-field"
          value={formData.slug}
          onChange={handleChange}
          placeholder="e.g. coffee (leave blank to auto-generate)"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className="input-field"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Short description for this category"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="label" htmlFor="sort_order">Sort Order</label>
            <input
                type="number"
                id="sort_order"
                name="sort_order"
                className="input-field"
                value={formData.sort_order}
                onChange={handleChange}
                min="0"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <span style={{ fontWeight: 500 }}>Active</span>
            </label>
          </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button 
            type="button" 
            onClick={() => router.back()}
            style={{ 
                padding: '0.75rem 1.5rem', 
                background: 'transparent', 
                color: 'hsl(var(--muted-foreground))', 
                border: 'none', 
                cursor: 'pointer',
                fontWeight: 600
            }}
        >
            Cancel
        </button>
        <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0.75rem 2rem' }}
        >
            {loading ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
        </button>
      </div>
    </form>
  );
}
