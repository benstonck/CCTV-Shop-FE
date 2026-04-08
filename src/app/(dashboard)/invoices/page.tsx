'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Search, Download, Eye, Trash2, ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { billingAPI, pdfAPI } from '@/lib/api';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const LIMIT = 15;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billingAPI.getAll({ search, page, limit: LIMIT });
      setInvoices(res.data.invoices);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(t);
  }, [fetchInvoices]);

  const handleDownload = async (id: number, invoiceNumber: string) => {
    try {
      const res = await pdfAPI.generate(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to generate PDF'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await billingAPI.delete(id);
      toast.success('Invoice deleted');
      setDeleteId(null);
      fetchInvoices();
    } catch { toast.error('Failed to delete'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">{total} total invoices</p>
        </div>
        <Link href="/billing" className="btn-primary">
          <Plus className="w-4 h-4" /> New Bill
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search by customer or invoice number..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input-field pl-10" />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Invoice #</th>
                <th className="table-th">Customer</th>
                <th className="table-th hidden sm:table-cell">Date</th>
                <th className="table-th">Amount</th>
                <th className="table-th hidden md:table-cell">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="table-td">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{search ? 'No invoices found' : 'No invoices yet'}</p>
                    {!search && (
                      <Link href="/billing" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                        Create first bill
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td font-mono text-xs font-semibold text-blue-700">{inv.invoice_number}</td>
                    <td className="table-td">
                      <p className="font-medium text-gray-900 text-sm">{inv.customer_name}</p>
                      <p className="text-xs text-gray-400 hidden sm:block">{inv.customer_phone}</p>
                    </td>
                    <td className="table-td hidden sm:table-cell text-gray-500 text-xs">{formatDate(inv.created_at)}</td>
                    <td className="table-td font-bold text-gray-900">{formatCurrency(inv.total_amount)}</td>
                    <td className="table-td hidden md:table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        inv.status === 'invoice' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inv.status === 'invoice' ? 'Invoice' : 'Estimate'}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/invoices/${inv.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDownload(inv.id, inv.invoice_number)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(inv.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-2 px-3">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 px-2">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary py-2 px-3">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Delete Invoice?</h3>
            <p className="text-gray-500 text-sm text-center mt-1 mb-6">This cannot be undone.</p>
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
