'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form-dialog';

export default function NewProductPage() {
  const router = useRouter();
  const returnToProducts = () => router.push('/admin/products');

  return <ProductForm onCancel={returnToProducts} onSaved={returnToProducts} />;
}
