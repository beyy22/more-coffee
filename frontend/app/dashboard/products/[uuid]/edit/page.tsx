'use client';

import { useEffect, useState } from 'react';
import ProductForm from '@/components/product-form';
import { apiRequest } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
  const { uuid } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uuid) {
      apiRequest<{data: any}>(`/products/${uuid}`)
        .then(res => setProduct(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [uuid]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Edit Product</h1>
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
        <ProductForm initialData={product} isEdit={true} />
      </div>
    </div>
  );
}
