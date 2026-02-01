'use client';

import CategoryForm from '@/components/category-form';

export default function CreateCategoryPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Add New Category</h1>
      <CategoryForm />
    </div>
  );
}
