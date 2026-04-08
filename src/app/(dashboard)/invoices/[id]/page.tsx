'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer, CheckCircle, FileText } from 'lucide-react';
import { billingAPI, pdfAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/auth';
import { Invoice, ShopSettings } from '@/types';
import toast from 'react-hot-toast';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [shop, setShop] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingAPI.getById(Number(id)).then(res => {
      setInvoice(res.data.invoice);
      setShop(res.data.shop);
    }).catch(() => toast.error('Invoice not found')).finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!invoice) return;
    try {
      const res = await pdfAPI.generate(invoice.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to generate PDF'); }
  };

  const markAsInvoice = async () => {
    if (!invoice) return;
    try {
      await billingAPI.updateStatus(invoice.id, 'invoice');
      setInvoice(prev => prev ? { ...prev, status: 'invoice' } : prev);
      toast.success('Marked as Tax Invoice');
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!invoice) return <div className="card text-center py-16 text-gray-500">Invoice not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Actions Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => router.back()} className="btn-secondary py-2 px-3">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{invoice.invoice_number}</h1>
          <p className="text-sm text-gray-500">{formatDate(invoice.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {invoice.status === 'estimate' && (
            <button onClick={markAsInvoice} className="btn-success py-2 px-4 text-sm">
              <CheckCircle className="w-4 h-4" /> Mark as Invoice
            </button>
          )}
          <button onClick={handleDownload} className="btn-primary py-2 px-4 text-sm">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button onClick={() => window.print()} className="btn-secondary py-2 px-3">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="card print:shadow-none" id="invoice-preview">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pb-5 border-b border-gray-200 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-primary-900">{shop?.shop_name || 'CCTV Shop'}</h2>
            <p className="text-gray-500 text-sm mt-1">{shop?.address}</p>
            <p className="text-gray-500 text-sm">{shop?.phone} · {shop?.email}</p>
            {shop?.gstin && <p className="text-gray-500 text-xs mt-0.5">GSTIN: {shop.gstin}</p>}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className={`font-bold text-lg ${invoice.status === 'invoice' ? 'text-green-700' : 'text-yellow-700'}`}>
                {invoice.status === 'invoice' ? 'TAX INVOICE' : 'ESTIMATE'}
              </span>
            </div>
            <p className="text-gray-600 font-mono text-sm">{invoice.invoice_number}</p>
            <p className="text-gray-400 text-xs mt-0.5">{formatDate(invoice.created_at)}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</p>
            <p className="font-bold text-gray-900">{invoice.customer_name}</p>
            {invoice.customer_phone && <p className="text-sm text-gray-600">{invoice.customer_phone}</p>}
            {invoice.customer_address && <p className="text-sm text-gray-600">{invoice.customer_address}</p>}
            {invoice.customer_gstin && <p className="text-xs text-gray-400 mt-1">GSTIN: {invoice.customer_gstin}</p>}
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Invoice Details</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Invoice No:</span>
                <span className="font-medium text-gray-800 font-mono">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium text-gray-800">{formatDate(invoice.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`font-semibold ${invoice.status === 'invoice' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {invoice.status === 'invoice' ? 'Invoice' : 'Estimate'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-900 text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Product</th>
                <th className="px-4 py-3 text-center text-xs font-semibold hidden sm:table-cell">HSN</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">Rate (₹)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold hidden md:table-cell">GST</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-gray-400">{item.unit}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs hidden sm:table-cell">{item.hsn_code || '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.base_price)}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs hidden md:table-cell">
                    {item.gst_percentage}% = {formatCurrency(item.gst_amount || 0)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">{formatCurrency(item.total_price || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST Amount:</span>
              <span>{formatCurrency(invoice.total_gst)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
              <span className="text-gray-900">Grand Total:</span>
              <span className="text-green-600">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-5 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          Thank you for your business! · Goods once sold will not be taken back. E. &amp; O.E.
        </div>
      </div>
    </div>
  );
}
