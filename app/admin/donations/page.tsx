'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CircleCheck as CheckCircle2, Clock, Circle as XCircle, Download, ExternalLink, DollarSign, Filter, RefreshCw, ArrowLeft } from 'lucide-react';

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  frequency: string;
  status: string;
  processor: string | null;
  processingEntity: string | null;
  transactionId: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  receiptUrl: string | null;
  message: string | null;
  completedAt: string | null;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  completed: { label: 'Completed', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-[#27AE60]', bg: 'bg-[#27AE60]/10 border-[#27AE60]/20' },
  paid: { label: 'Paid', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-[#27AE60]', bg: 'bg-[#27AE60]/10 border-[#27AE60]/20' },
  pending: { label: 'Pending', icon: <Clock className="h-3.5 w-3.5" />, color: 'text-[#C8A75E]', bg: 'bg-[#C8A75E]/10 border-[#C8A75E]/20' },
  failed: { label: 'Failed', icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-[#E07070]', bg: 'bg-[#E07070]/10 border-[#E07070]/20' },
  refunded: { label: 'Refunded', icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-[#E07070]', bg: 'bg-[#E07070]/10 border-[#E07070]/20' },
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency?.toUpperCase() || 'USD' }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toCSV(rows: Donation[]): string {
  const headers = ['Reference', 'Date', 'Donor Name', 'Email', 'Amount', 'Currency', 'Frequency', 'Status', 'Processor', 'Processing Entity', 'Stripe Session', 'Stripe PaymentIntent', 'Completed At', 'Message'];
  const escape = (v: string | null | undefined) => v == null ? '' : `"${String(v).replace(/"/g, '""')}"`
  const lines = rows.map(d => [d.transactionId, d.createdAt, d.donorName, d.donorEmail, d.amount, d.currency, d.frequency, d.status, d.processor, d.processingEntity, d.stripeSessionId, d.stripePaymentIntentId, d.completedAt, d.message].map(v => escape(v == null ? null : String(v))).join(','));
  return [headers.map(h => `"${h}"`).join(','), ...lines].join('\n');
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/donations');
      const data = await res.json();
      setDonations(data.donations ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  const filtered = donations.filter(d => statusFilter === 'all' || d.status === statusFilter || (statusFilter === 'completed' && d.status === 'paid'));
  const totalPaid = donations.filter(d => d.status === 'paid' || d.status === 'completed').reduce((sum, d) => sum + d.amount, 0);

  function downloadCSV() {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#080A18] text-[#F5F3EE] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-[#AAB0D6]/40 hover:text-[#C8A75E] transition-colors text-xs mb-1">
              <ArrowLeft className="w-3 h-3" />
              Admin
            </Link>
            <h1 className="text-2xl font-serif font-bold text-[#F5F3EE]">Donations</h1>
            <p className="text-sm text-[#AAB0D6]/60 mt-1">Read-only view — payment governance enforced</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchDonations} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8 text-[#AAB0D6] hover:text-[#F5F3EE] hover:border-white/20 transition-all text-sm">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C8A75E]/10 border border-[#C8A75E]/20 text-[#C8A75E] hover:bg-[#C8A75E]/20 transition-all text-sm">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-[#0D1020] border border-white/8 p-5">
            <div className="flex items-center gap-3 mb-2"><DollarSign className="h-5 w-5 text-[#27AE60]" /><span className="text-xs text-[#AAB0D6]/60 uppercase tracking-wider">Total Confirmed</span></div>
            <p className="text-2xl font-semibold text-[#F5F3EE]">{formatAmount(totalPaid, 'USD')}</p>
          </div>
          <div className="rounded-2xl bg-[#0D1020] border border-white/8 p-5">
            <div className="flex items-center gap-3 mb-2"><CheckCircle2 className="h-5 w-5 text-[#27AE60]" /><span className="text-xs text-[#AAB0D6]/60 uppercase tracking-wider">Paid</span></div>
            <p className="text-2xl font-semibold text-[#F5F3EE]">{donations.filter(d => d.status === 'paid').length}</p>
          </div>
          <div className="rounded-2xl bg-[#0D1020] border border-white/8 p-5">
            <div className="flex items-center gap-3 mb-2"><Clock className="h-5 w-5 text-[#C8A75E]" /><span className="text-xs text-[#AAB0D6]/60 uppercase tracking-wider">Pending</span></div>
            <p className="text-2xl font-semibold text-[#F5F3EE]">{donations.filter(d => d.status === 'pending').length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-4 w-4 text-[#AAB0D6]/40" />
          {(['all', 'paid', 'pending', 'failed'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s ? 'bg-[#C8A75E]/20 border border-[#C8A75E]/30 text-[#C8A75E]' : 'border border-white/8 text-[#AAB0D6]/60 hover:text-[#AAB0D6]'}`}>{s}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#AAB0D6]/40 text-sm">Loading donations...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-[#AAB0D6]/40 text-sm">No donations found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(donation => {
              const meta = STATUS_META[donation.status] ?? STATUS_META.pending;
              const isOpen = expanded === donation.id;
              return (
                <div key={donation.id} className="rounded-2xl bg-[#0D1020] border border-white/8 overflow-hidden">
                  <button className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-all" onClick={() => setExpanded(isOpen ? null : donation.id)}>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${meta.color} ${meta.bg}`}>{meta.icon}{meta.label}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F5F3EE] truncate">{donation.donorName}</p>
                      <p className="text-xs text-[#AAB0D6]/50 truncate">{donation.donorEmail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#F5F3EE]">{formatAmount(donation.amount, donation.currency)}</p>
                      <p className="text-xs text-[#AAB0D6]/40 capitalize">{donation.frequency?.replace('_', '-')}</p>
                    </div>
                    <p className="text-xs text-[#AAB0D6]/40 shrink-0 hidden sm:block">{formatDate(donation.createdAt)}</p>
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/5 px-6 py-5 bg-[#080A18]/60">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4">
                        <div><span className="text-[#AAB0D6]/40 text-xs">Reference</span><p className="font-mono text-xs text-[#F5F3EE] mt-0.5">{donation.transactionId}</p></div>
                        <div><span className="text-[#AAB0D6]/40 text-xs">Processor</span><p className="text-[#F5F3EE] mt-0.5 capitalize">{donation.processor ?? '—'}</p></div>
                        <div><span className="text-[#AAB0D6]/40 text-xs">Processing Entity</span><p className="text-[#F5F3EE] mt-0.5">{donation.processingEntity ?? '—'}</p></div>
                        {donation.stripeSessionId && <div><span className="text-[#AAB0D6]/40 text-xs">Stripe Session</span><p className="font-mono text-xs text-[#F5F3EE] mt-0.5 truncate">{donation.stripeSessionId}</p></div>}
                        {donation.stripePaymentIntentId && <div><span className="text-[#AAB0D6]/40 text-xs">Payment Intent</span><p className="font-mono text-xs text-[#F5F3EE] mt-0.5 truncate">{donation.stripePaymentIntentId}</p></div>}
                        {donation.completedAt && <div><span className="text-[#AAB0D6]/40 text-xs">Completed At</span><p className="text-[#F5F3EE] mt-0.5">{formatDate(donation.completedAt)}</p></div>}
                        {donation.message && <div className="col-span-2"><span className="text-[#AAB0D6]/40 text-xs">Message</span><p className="text-[#AAB0D6] mt-0.5 text-sm leading-relaxed">{donation.message}</p></div>}
                      </div>
                      {donation.receiptUrl && (
                        <a href={donation.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#C8A75E] hover:text-[#C8A75E]/80 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View in Stripe Dashboard
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
