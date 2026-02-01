'use client';

import { useState, useEffect, use } from 'react';
import { apiRequest } from '@/lib/api';
import CategoryForm from '@/components/category-form';

export default function EditCategoryPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await apiRequest<{ data: any }>(`/categories/${uuid}`);
        setCategory(response.data);
      } catch (error) {
        console.error('Failed to fetch category', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [uuid]);

  if (loading) return <div>Loading...</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Edit Category</h1>
      <CategoryForm initialData={category} isEdit={true} />
    </div>
  );
}
