'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, FileText, TrendingUp, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { billingAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/auth';
import { Invoice, Product } from '@/types';

interface Stats { totalProducts: number; totalInvoices: number; totalRevenue: number }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalInvoices: 0, totalRevenue: 0 });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingAPI.getStats().then(res => {
      setStats(res.data.stats);
      setRecentInvoices(res.data.recentInvoices);
      setLowStock(res.data.lowStockProducts);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      href: '/products',
    },
    {
      label: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FileText,
      color: 'bg-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      href: '/invoices',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'bg-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      href: '/invoices',
    },
    {
      label: 'Low Stock Items',
      value: lowStock.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
      href: '/products',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here&apos;s your shop summary.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products/new" className="btn-secondary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link href="/billing" className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> New Bill
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="card hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.text}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <div className={`text-2xl font-bold ${card.text}`}>{card.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Recent Invoices
            </h3>
            <Link href="/invoices" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <EmptyState icon={FileText} text="No invoices yet" action={{ href: '/billing', label: 'Create First Bill' }} />
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.customer_name}</p>
                    <p className="text-xs text-gray-400">{inv.invoice_number} · {formatDate(inv.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.total_amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      inv.status === 'invoice' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Low Stock Alert
            </h3>
            <Link href="/products" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.unit}</p>
                  </div>
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                    product.stock_quantity === 0 ? 'bg-red-200 text-red-800' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {product.stock_quantity === 0 ? 'Out of Stock' : `${product.stock_quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: '/products/new', label: 'Add New Product', desc: 'Register a new CCTV product', icon: Package, color: 'blue' },
          { href: '/billing', label: 'Create New Bill', desc: 'Generate a customer estimate', icon: FileText, color: 'green' },
          { href: '/invoices', label: 'View All Invoices', desc: 'Browse and download invoices', icon: TrendingUp, color: 'purple' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`card hover:shadow-md transition-all border-l-4 border-${item.color}-500 group`}>
            <div className={`w-8 h-8 bg-${item.color}-100 rounded-lg flex items-center justify-center mb-3`}>
              <item.icon className={`w-4 h-4 text-${item.color}-600`} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, action }: { icon: React.ElementType; text: string; action?: { href: string; label: string } }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <Icon className="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">{text}</p>
      {action && (
        <Link href={action.href} className="text-xs text-blue-600 hover:underline mt-2 block">{action.label}</Link>
      )}
    </div>
  );
}
