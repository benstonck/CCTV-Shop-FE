'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit2, Trash2, Package, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/auth';
import toast from 'react-hot-toast';

const GST_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-600',
  5: 'bg-green-100 text-green-700',
  12: 'bg-blue-100 text-blue-700',
  18: 'bg-orange-100 text-orange-700',
  28: 'bg-red-100 text-red-700',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const LIMIT = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll({ search, page, limit: LIMIT });
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{total} products in inventory</p>
        </div>
        <Link href="/products/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, HSN code..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input-field pl-10"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="w-full h-36 bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-semibold">No products found</h3>
          <p className="text-gray-400 text-sm mt-1">
            {search ? `No results for "${search}"` : 'Add your first product to get started'}
          </p>
          {!search && (
            <Link href="/products/new" className="btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="card hover:shadow-md transition-shadow group p-0 overflow-hidden">
              {/* Image */}
              <div className="relative w-full h-36 bg-gray-100">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                {/* Stock Badge */}
                <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold shadow ${
                  product.stock_quantity === 0 ? 'bg-red-500 text-white' :
                  product.stock_quantity < 5 ? 'bg-orange-400 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  {product.stock_quantity === 0 ? 'Out' : `${product.stock_quantity}`}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
                  {product.name}
                </h3>
                {product.hsn_code && (
                  <p className="text-xs text-gray-400 mb-1.5">HSN: {product.hsn_code}</p>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-blue-700">{formatCurrency(product.base_price)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GST_COLORS[product.gst_percentage] || GST_COLORS[18]}`}>
                    GST {product.gst_percentage}%
                  </span>
                </div>
                <p className="text-xs text-gray-400">per {product.unit}</p>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Link href={`/products/edit/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium
                      text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium
                      text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary py-2 px-3 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 px-3">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="btn-secondary py-2 px-3 disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Delete Product?</h3>
            <p className="text-gray-500 text-sm text-center mt-1 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1 justify-center">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
