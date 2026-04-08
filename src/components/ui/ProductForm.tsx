'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, X, Package, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI } from '@/lib/api';
import { Product, GST_RATES } from '@/types';

interface ProductFormData {
  name: string;
  description: string;
  base_price: number;
  gst_percentage: number;
  hsn_code: string;
  unit: string;
  stock_quantity: number;
}

interface Props {
  product?: Product;
  isEdit?: boolean;
}

const UNITS = ['pcs', 'meter', 'roll', 'set', 'box', 'pair', 'kg', 'ltr', 'ft'];

export default function ProductForm({ product, isEdit = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      base_price: product?.base_price || 0,
      gst_percentage: product?.gst_percentage || 18,
      hsn_code: product?.hsn_code || '',
      unit: product?.unit || 'pcs',
      stock_quantity: product?.stock_quantity || 0,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)));
      if (imageFile) formData.append('image', imageFile);

      if (isEdit && product) {
        await productsAPI.update(product.id, formData);
        toast.success('Product updated successfully!');
      } else {
        await productsAPI.create(formData);
        toast.success('Product added successfully!');
      }
      router.push('/products');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-gray-500">{isEdit ? 'Update product details' : 'Register a new product to inventory'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Image Upload */}
        <div className="card">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Product Image</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer
              hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            {imagePreview ? (
              <div className="relative">
                <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                  className="absolute top-0 right-1/4 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-xs text-gray-400 mt-2">Click to change image</p>
              </div>
            ) : (
              <div>
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · Max 5MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Basic Info */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" /> Product Details
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
            <input
              className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              placeholder="e.g. Hikvision 2MP Dome Camera"
              {...register('name', { required: 'Product name is required' })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="Product specifications, features..."
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">HSN Code</label>
              <input className="input-field" placeholder="e.g. 85258090" {...register('hsn_code')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
              <select className="input-field" {...register('unit')}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800">Pricing & Stock</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`input-field ${errors.base_price ? 'border-red-400' : ''}`}
                placeholder="0.00"
                {...register('base_price', { required: 'Price is required', min: { value: 0, message: 'Must be positive' } })}
              />
              {errors.base_price && <p className="text-red-500 text-xs mt-1">{errors.base_price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">GST Rate *</label>
              <select className="input-field" {...register('gst_percentage')}>
                {GST_RATES.map(rate => (
                  <option key={rate} value={rate}>{rate}% GST</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
            <input
              type="number"
              min="0"
              className="input-field"
              placeholder="0"
              {...register('stock_quantity', { min: { value: 0, message: 'Cannot be negative' } })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg> Saving...</>
            ) : isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
