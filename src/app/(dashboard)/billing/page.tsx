'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Minus, Trash2, FileText, ShoppingCart, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI, billingAPI } from '@/lib/api';
import { Product, BillItem } from '@/types';
import { formatCurrency } from '@/lib/auth';

interface CartItem extends BillItem {
  _key: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [notes, setNotes] = useState('');
  const [invoiceType, setInvoiceType] = useState<'estimate' | 'invoice'>('estimate');
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productsAPI.getAll({ search, limit: 50 });
      setProducts(res.data.products);
    } catch {
      toast.error('Failed to load products');
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const addToCart = (product: Product) => {
    const existing = cart.find(c => c.product_id === product.id);
    if (existing) {
      setCart(cart.map(c =>
        c.product_id === product.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, {
        _key: `${product.id}-${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        hsn_code: product.hsn_code,
        unit: product.unit,
        quantity: 1,
        base_price: product.base_price,
        gst_percentage: product.gst_percentage,
      }]);
    }
    toast.success(`${product.name} added`, { duration: 1200 });
  };

  const updateQty = (key: string, delta: number) => {
    setCart(cart
      .map(c => c._key === key ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0)
    );
  };

  const removeItem = (key: string) => setCart(cart.filter(c => c._key !== key));

  // Calculate totals
  const calcItem = (item: CartItem) => {
    const subtotal = item.base_price * item.quantity;
    const gstAmt = (subtotal * item.gst_percentage) / 100;
    return { subtotal, gstAmt, total: subtotal + gstAmt };
  };

  const subtotal = cart.reduce((s, c) => s + calcItem(c).subtotal, 0);
  const totalGst = cart.reduce((s, c) => s + calcItem(c).gstAmt, 0);
  const grandTotal = subtotal + totalGst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) { toast.error('Customer name is required'); return; }
    if (cart.length === 0) { toast.error('Add at least one product'); return; }

    setLoading(true);
    try {
      const res = await billingAPI.create({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_gstin: customerGstin,
        notes,
        status: invoiceType,
        items: cart.map(c => ({
          product_id: c.product_id,
          product_name: c.product_name,
          hsn_code: c.hsn_code || '',
          unit: c.unit || 'pcs',
          quantity: c.quantity,
          base_price: c.base_price,
          gst_percentage: c.gst_percentage,
        })),
      });
      toast.success(`${invoiceType === 'invoice' ? 'Invoice' : 'Estimate'} created!`);
      router.push(`/invoices/${res.data.invoice.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Bill</h1>
          <p className="text-sm text-gray-500">Select products and generate estimate or invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Product Search */}
          <div className="lg:col-span-3 space-y-4">
            {/* Customer Info */}
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-800">Customer Details</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name *</label>
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                    className="input-field" placeholder="e.g. Rajesh Kumar" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    className="input-field" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                    className="input-field" placeholder="Customer address" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">GSTIN (optional)</label>
                  <input value={customerGstin} onChange={e => setCustomerGstin(e.target.value)}
                    className="input-field" placeholder="29AABCU9603R1ZX" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2} className="input-field resize-none" placeholder="Additional notes..." />
              </div>

              {/* Invoice Type */}
              <div className="flex gap-2">
                <label className="flex-1">
                  <input type="radio" name="type" value="estimate" checked={invoiceType === 'estimate'}
                    onChange={() => setInvoiceType('estimate')} className="sr-only" />
                  <div className={`text-center py-2 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium
                    ${invoiceType === 'estimate' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    📋 Estimate
                  </div>
                </label>
                <label className="flex-1">
                  <input type="radio" name="type" value="invoice" checked={invoiceType === 'invoice'}
                    onChange={() => setInvoiceType('invoice')} className="sr-only" />
                  <div className={`text-center py-2 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium
                    ${invoiceType === 'invoice' ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    🧾 Tax Invoice
                  </div>
                </label>
              </div>
            </div>

            {/* Product Search */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">Add Products</h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  className="input-field pl-9" placeholder="Search products..." />
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {products.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{search ? 'No matching products' : 'No products available'}</p>
                  </div>
                ) : (
                  products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(product.base_price)} / {product.unit} · GST {product.gst_percentage}%
                          {product.stock_quantity === 0 && <span className="ml-1 text-red-500">(Out of stock)</span>}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="ml-3 flex items-center gap-1 btn-primary py-1.5 px-3 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Cart + Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cart */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                Cart
                {cart.length > 0 && <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{cart.length}</span>}
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Cart is empty</p>
                  <p className="text-xs mt-1">Add products from the left</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map(item => {
                    const { subtotal, gstAmt, total } = calcItem(item);
                    return (
                      <div key={item._key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-semibold text-gray-800 leading-tight flex-1 pr-2">{item.product_name}</p>
                          <button type="button" onClick={() => removeItem(item._key)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => updateQty(item._key, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-red-50 hover:border-red-300">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                            <button type="button" onClick={() => updateQty(item._key, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-green-50 hover:border-green-300">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{formatCurrency(subtotal)} + GST {formatCurrency(gstAmt)}</p>
                            <p className="text-sm font-bold text-blue-700">{formatCurrency(total)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bill Summary */}
            {cart.length > 0 && (
              <div className="card bg-primary-900 text-white">
                <h3 className="font-semibold mb-4 text-blue-200">Bill Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-blue-200">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-blue-200">
                    <span>GST Amount</span>
                    <span>{formatCurrency(totalGst)}</span>
                  </div>
                  <div className="border-t border-blue-700 pt-2 mt-2 flex justify-between font-bold text-base">
                    <span className="text-white">Grand Total</span>
                    <span className="text-green-400 text-lg">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* GST Breakdown by Rate */}
                <div className="mt-3 pt-3 border-t border-blue-800">
                  <p className="text-xs text-blue-400 mb-2">GST Breakdown</p>
                  {Object.entries(
                    cart.reduce((acc, item) => {
                      const { gstAmt } = calcItem(item);
                      acc[item.gst_percentage] = (acc[item.gst_percentage] || 0) + gstAmt;
                      return acc;
                    }, {} as Record<number, number>)
                  ).map(([rate, amount]) => (
                    <div key={rate} className="flex justify-between text-xs text-blue-300">
                      <span>GST @{rate}%</span><span>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl
                    flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg> Creating...</>
                  ) : (
                    <><FileText className="w-5 h-5" /> Generate {invoiceType === 'invoice' ? 'Invoice' : 'Estimate'}</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
