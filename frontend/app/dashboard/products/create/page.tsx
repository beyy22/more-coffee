'use client';

import ProductForm from '@/components/product-form';

export default function CreateProductPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add New Product</h1>
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
        <ProductForm />
      </div>
    </div>
  );
}
