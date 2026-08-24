'use client';

import React, { useState, useEffect } from 'react';
import { ProductForm } from '@/components/admin/ProductForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { error } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.data.product);
        } else {
          error(data.error || 'Failed to load product');
        }
      })
      .catch(() => error('Failed to load product'))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-8 text-center text-rose-400">Product not found.</div>;
  }

  return <ProductForm initialData={product} isEditing={true} />;
}
