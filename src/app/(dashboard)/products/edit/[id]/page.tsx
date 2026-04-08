'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';
import ProductForm from '@/components/ui/ProductForm';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI.getById(Number(id))
      .then(res => setProduct(res.data.product))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!product) return (
    <div className="card text-center py-16 text-gray-500">Product not found.</div>
  );

  return <ProductForm product={product} isEdit />;
}
