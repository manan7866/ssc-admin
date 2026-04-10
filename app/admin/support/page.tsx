'use client';

import { useState, useEffect, useCallback } from 'react';
import { LifeBuoy, RefreshCw, Search, ChevronDown, ChevronUp, Send, Loader as Loader2, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Clock, X } from 'lucide-react';

interface Reply {
  id: string;
  author_type: 'admin' | 'user';
  body: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  sessionToken: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  replies?: Reply[];
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'] as const;

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  in_progress: { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  resolved: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  closed: { label: 'Closed', color: 'text-[#AAB0D6]/50', bg: 'bg-white/4 border-white/8' },
};

const PRIORITY_DOTS: Record<string, string> = {
  low: 'bg-blue-400/60',
  medium: 'bg-amber-400/70',
  high: 'bg-rose-400/70',
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  membership: 'Membership & Access',
  donation: 'Donation & Payment',
  research: 'Research & Collaboration',
  technical: 'Technical Issue',
  other: 'Other',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [sendError, setSendError] = useState<Record<string, string>>({});

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/support', { credentials: 'include' });
      const data = await res.json();
      console.log('[support] Tickets data:', data);
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('[support] Error loading tickets:', err);
      setTickets([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  async function toggleExpand(ticketId: string) {
    if (expanded === ticketId) {
      setExpanded(null);
    } else {
      setExpanded(ticketId);
    }
  }

  async function handleSendReply(ticket: Ticket) {
    const text = replyText[ticket.id]?.trim();
    if (!text) return;
    setSending(ticket.id);
    setSendError((prev) => ({ ...prev, [ticket.id]: '' }));
    try {
      setReplies((prev) => ({
        ...prev,
        [ticket.id]: [
          ...(prev[ticket.id] || []),
          { id: crypto.randomUUID(), author_type: 'admin', body: text, createdAt: new Date().toISOString() },
        ],
      }));
      setReplyText((prev) => ({ ...prev, [ticket.id]: '' }));
    } catch (err: unknown) {
      setSendError((prev) => ({ ...prev, [ticket.id]: err instanceof Error ? err.message : 'Failed to send.' }));
    }
    setSending(null);
  }

  async function updateStatus(ticketId: string, status: string) {
    setUpdatingStatus(ticketId);
    try {
      await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, status }),
        credentials: 'include',
      });
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
    } catch (err) {
      console.error('[support] Error updating ticket status:', err);
    }
    setUpdatingStatus(null);
  }

  const filtered = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.ticketNumber?.toLowerCase().includes(s) ||
      t.subject?.toLowerCase().includes(s) ||
      t.description?.toLowerCase().includes(s) ||
      t.sessionToken?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] flex items-center gap-2">
            <LifeBuoy size={20} className="text-[#C8A75E]" />
            Support Tickets
          </h1>
          <p className="text-xs text-[#AAB0D6]/60 mt-1">Manage and respond to user support requests</p>
        </div>
        <button
          onClick={loadTickets}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-[#AAB0D6] text-sm hover:bg-white/5 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AAB0D6]/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets, subjects, session IDs…"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0A0C14] border border-white/10 text-[#F5F3EE] text-sm placeholder:text-[#AAB0D6]/30 focus:outline-none focus:border-[#C8A75E]/40 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', ...STATUS_OPTIONS] as string[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                statusFilter === s
                  ? 'bg-[#C8A75E]/10 border-[#C8A75E]/25 text-[#C8A75E]'
                  : 'border-white/8 text-[#AAB0D6]/60 hover:text-[#AAB0D6] hover:border-white/12'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_STYLES[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="w-5 h-5 text-[#C8A75E]/40 animate-spin" />
          <span className="text-sm text-[#AAB0D6]/50">Loading tickets…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#AAB0D6]/40">
          <LifeBuoy className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const isExpanded = expanded === ticket.id;
            const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
            const ticketReplies = replies[ticket.id] || [];

            return (
              <div key={ticket.id} className="bg-[#0B0F2A] border border-white/8 rounded-2xl overflow-hidden">
                <div
                  className="flex items-start gap-4 p-5 cursor-pointer hover:bg-white/2 transition-colors"
                  onClick={() => toggleExpand(ticket.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[10px] font-mono text-[#C8A75E]/60 tracking-wider">{ticket.ticketNumber}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.color}`}>
                        {statusStyle.label}
                      </span>
                      <span className="text-[10px] text-[#AAB0D6]/40">{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[ticket.priority] || 'bg-white/20'}`} />
                      <span className="text-[10px] text-[#AAB0D6]/40 capitalize">{ticket.priority}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#F5F3EE]">{ticket.subject}</h3>
                    <p className="text-[10px] text-[#AAB0D6]/30 mt-1">
                      {formatDate(ticket.createdAt)} · Session: {String(ticket.sessionToken).slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {ticketReplies.length > 0 && (
                      <span className="text-[10px] text-[#AAB0D6]/40">{ticketReplies.length} replies</span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#AAB0D6]/30" /> : <ChevronDown className="w-4 h-4 text-[#AAB0D6]/30" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 p-5 space-y-5">
                    <div>
                      <p className="text-[10px] text-[#AAB0D6]/30 uppercase tracking-widest mb-2">Description</p>
                      <p className="text-sm text-[#AAB0D6] leading-relaxed whitespace-pre-wrap bg-[#0A0C14]/60 rounded-xl p-4 border border-white/5">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-xs text-[#AAB0D6]/50 flex-shrink-0">Change status:</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(ticket.id, s)}
                            disabled={ticket.status === s || updatingStatus === ticket.id}
                            className={`text-[10px] px-2.5 py-1 rounded-md border transition-all font-medium disabled:opacity-40 ${
                              ticket.status === s
                                ? `${STATUS_STYLES[s].bg} ${STATUS_STYLES[s].color}`
                                : 'border-white/8 text-[#AAB0D6]/50 hover:border-white/15 hover:text-[#AAB0D6]'
                            }`}
                          >
                            {updatingStatus === ticket.id && ticket.status !== s ? (
                              <Loader2 className="w-3 h-3 animate-spin inline" />
                            ) : (
                              STATUS_STYLES[s]?.label ?? s
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {ticketReplies.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-[#AAB0D6]/30 uppercase tracking-widest">
                          Replies ({ticketReplies.length})
                        </p>
                        {ticketReplies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`rounded-xl p-3 border ${
                              reply.author_type === 'admin'
                                ? 'bg-[#C8A75E]/5 border-[#C8A75E]/15'
                                : 'bg-white/2 border-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                                reply.author_type === 'admin' ? 'text-[#C8A75E]' : 'text-[#AAB0D6]/50'
                              }`}>
                                {reply.author_type === 'admin' ? 'Admin Reply' : 'User'}
                              </span>
                              <span className="text-[10px] text-[#AAB0D6]/25">{timeAgo(reply.createdAt)}</span>
                            </div>
                            <p className="text-sm text-[#AAB0D6] leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] text-[#AAB0D6]/30 uppercase tracking-widest mb-2">Send Admin Reply</p>
                      <textarea
                        value={replyText[ticket.id] || ''}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                        rows={3}
                        placeholder="Type your response to the user…"
                        className="w-full px-4 py-3 rounded-xl bg-[#0A0C14] border border-white/8 text-[#F5F3EE] text-sm placeholder:text-[#AAB0D6]/25 focus:outline-none focus:border-[#C8A75E]/40 transition-all resize-none mb-2"
                      />
                      {sendError[ticket.id] && (
                        <div className="flex items-center gap-2 text-rose-400 text-xs mb-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {sendError[ticket.id]}
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSendReply(ticket)}
                          disabled={!replyText[ticket.id]?.trim() || sending === ticket.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C8A75E]/12 border border-[#C8A75E]/25 text-[#C8A75E] text-xs font-semibold hover:bg-[#C8A75E]/18 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {sending === ticket.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          {sending === ticket.id ? 'Sending…' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-[#AAB0D6]/20 text-center">
        Showing {filtered.length} of {tickets.length} tickets
      </p>
    </div>
  );
}
