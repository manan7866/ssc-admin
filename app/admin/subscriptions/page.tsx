'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CircleCheck as CheckCircle2, Clock, Circle as XCircle, Download, ExternalLink, RefreshCw, ArrowLeft, CreditCard } from 'lucide-react';

interface Donor {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  country: string | null;
  anonymous: boolean;
  stripeCustomerId: string | null;
}

interface Subscription {
  id: string;
  donorId: string;
  amountCents: number;
  currency: string;
  interval: string;
  status: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  donor: Donor;
}

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  active: { label: 'Active', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-[#27AE60]', bg: 'bg-[#27AE60]/10 border-[#27AE60]/20' },
  pending: { label: 'Pending', icon: <Clock className="h-3.5 w-3.5" />, color: 'text-[#C8A75E]', bg: 'bg-[#C8A75E]/10 border-[#C8A75E]/20' },
  past_due: { label: 'Past Due', icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-[#E07070]', bg: 'bg-[#E07070]/10 border-[#E07070]/20' },
  canceled: { label: 'Canceled', icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-[#AAB0D6]', bg: 'bg-[#AAB0D6]/10 border-[#AAB0D6]/20' },
};

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency?.toUpperCase() || 'USD' }).format(cents / 100);
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'past_due' | 'canceled'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions');
      const data = await res.json();
      setSubscriptions(data.subscriptions ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const filtered = subscriptions.filter(s => statusFilter === 'all' || s.status === statusFilter);
  const totalMonthly = subscriptions
    .filter(s => s.status === 'active' && s.interval === 'month')
    .reduce((sum, s) => sum + s.amountCents, 0);

  return (
    <div className="min-h-screen bg-[#080A18] text-[#F5F3EE] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-[#AAB0D6]/40 hover:text-[#C8A75E] transition-colors text-xs mb-1">
              <ArrowLeft className="w-3 h-3" />
              Admin
            </Link>
            <h1 className="text-2xl font-serif font-bold text-[#F5F3EE]">Monthly Subscriptions</h1>
            <p className="text-sm text-[#AAB0D6]/60 mt-1">Recurring donation subscriptions</p>
          </div>
          <button onClick={fetchSubscriptions} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8 text-[#AAB0D6] hover:text-[#F5F3EE] hover:border-white/20 transition-all text-sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-[#0D1020] border border-white/8 p-5">
            <div className="flex items-center gap-3 mb-2"><CreditCard className="h-5 w-5 text-[#27AE60]" /><span className="text-xs text-[#AAB0D6]/60 uppercase tracking-wider">Monthly Recurring</span></div>
            <p className="text-2xl font-semibold text-[#F5F3EE]">{formatAmount(totalMonthly, 'USD')}/mo</p>
          </div>
          <div className="rounded-2xl bg-[#0D1020] border border-white/8 p-5">
            <div className="flex items-center gap-3 mb-2"><CheckCircle2 className="h-5 w-5 text-[#27AE60]" /><span className="text-xs text-[#AAB0D6]/60 uppercase tracking-wider">Active</span></div>
            <p className="text-2xl font-semibold text-[#F5F3EE]">{subscriptions.filter(s => s.status === 'active').length}</p>
          </div>
          <div className="rounded-2xl bg-[#0D1020] border border-white/8 p-5">
            <div className="flex items-center gap-3 mb-2"><Clock className="h-5 w-5 text-[#C8A75E]" /><span className="text-xs text-[#AAB0D6]/60 uppercase tracking-wider">Past Due</span></div>
            <p className="text-2xl font-semibold text-[#F5F3EE]">{subscriptions.filter(s => s.status === 'past_due').length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {(['all', 'active', 'past_due', 'canceled'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s ? 'bg-[#C8A75E]/20 border border-[#C8A75E]/30 text-[#C8A75E]' : 'border border-white/8 text-[#AAB0D6]/60 hover:text-[#AAB0D6]'}`}>{s === 'all' ? 'All' : s.replace('_', ' ')}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#AAB0D6]/40 text-sm">Loading subscriptions...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-[#AAB0D6]/40 text-sm">No subscriptions found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(sub => {
              const meta = STATUS_META[sub.status] ?? STATUS_META.pending;
              const isOpen = expanded === sub.id;
              const donorName = sub.donor.anonymous ? 'Anonymous' : sub.donor.fullName;
              return (
                <div key={sub.id} className="rounded-2xl bg-[#0D1020] border border-white/8 overflow-hidden">
                  <button className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-all" onClick={() => setExpanded(isOpen ? null : sub.id)}>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${meta.color} ${meta.bg}`}>{meta.icon}{meta.label}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F5F3EE] truncate">{donorName}</p>
                      <p className="text-xs text-[#AAB0D6]/50 truncate">{sub.donor.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#F5F3EE]">{formatAmount(sub.amountCents, sub.currency)}/{sub.interval}</p>
                    </div>
                    <p className="text-xs text-[#AAB0D6]/40 shrink-0 hidden sm:block">{formatDate(sub.currentPeriodEnd)}</p>
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/5 px-6 py-5 bg-[#080A18]/60">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4">
                        <div><span className="text-[#AAB0D6]/40 text-xs">Stripe Subscription</span><p className="font-mono text-xs text-[#F5F3EE] mt-0.5">{sub.stripeSubscriptionId ?? '—'}</p></div>
                        <div><span className="text-[#AAB0D6]/40 text-xs">Current Period</span><p className="text-[#F5F3EE] mt-0.5">{formatDate(sub.currentPeriodStart)} – {formatDate(sub.currentPeriodEnd)}</p></div>
                        <div><span className="text-[#AAB0D6]/40 text-xs">Cancel at Period End</span><p className="text-[#F5F3EE] mt-0.5">{sub.cancelAtPeriodEnd ? 'Yes' : 'No'}</p></div>
                        {sub.canceledAt && <div><span className="text-[#AAB0D6]/40 text-xs">Canceled At</span><p className="text-[#F5F3EE] mt-0.5">{formatDate(sub.canceledAt)}</p></div>}
                        <div><span className="text-[#AAB0D6]/40 text-xs">Phone</span><p className="text-[#F5F3EE] mt-0.5">{sub.donor.phone ?? '—'}</p></div>
                        <div><span className="text-[#AAB0D6]/40 text-xs">Country</span><p className="text-[#F5F3EE] mt-0.5">{sub.donor.country ?? '—'}</p></div>
                      </div>
                      {sub.stripeSubscriptionId && (
                        <a href={`https://dashboard.stripe.com/subscriptions/${sub.stripeSubscriptionId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#C8A75E] hover:text-[#C8A75E]/80 transition-colors">
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