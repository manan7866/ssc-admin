'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw, Search, ChevronDown, ChevronUp, Send, Loader2, AlertCircle, CheckCircle2, Clock, MessageSquare, Flag } from 'lucide-react';

interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  enquiryType: string;
  subject: string;
  message: string;
  status: string;
  replied: boolean;
  repliedAt: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  new: number;
  replied: number;
  complaint: number;
}

const STATUS_OPTIONS = ['new', 'read', 'in_progress', 'resolved'] as const;

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  read: { label: 'Read', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  in_progress: { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  resolved: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
};

const ENQUIRY_TYPE_STYLES: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  general: { label: 'General', color: 'text-[#AAB0D6]', bg: 'bg-white/5 border-white/10', icon: <Mail size={10} /> },
  research: { label: 'Research', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: <MessageSquare size={10} /> },
  media: { label: 'Media', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20', icon: <MessageSquare size={10} /> },
  membership: { label: 'Membership', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <MessageSquare size={10} /> },
  events: { label: 'Events', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', icon: <MessageSquare size={10} /> },
  complain: { label: 'Complaint', color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20', icon: <Flag size={10} /> },
  other: { label: 'Other', color: 'text-[#AAB0D6]/60', bg: 'bg-white/3 border-white/8', icon: <MessageSquare size={10} /> },
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

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, new: 0, replied: 0, complaint: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [sendError, setSendError] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contact-submissions', { credentials: 'include' });
      const data = await res.json();
      setSubmissions(data.submissions || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('[contact-submissions] Error loading:', err);
      setSubmissions([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function toggleExpand(id: string) {
    setExpanded(expanded === id ? null : id);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      await fetch('/api/admin/contact-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
        credentials: 'include',
      });
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    } catch (err) {
      console.error('[contact-submissions] Error updating status:', err);
    }
    setUpdating(null);
  }

  async function sendReply(submission: ContactSubmission) {
    const text = replyText[submission.id]?.trim();
    if (!text) return;
    setSending(submission.id);
    setSendError((prev) => ({ ...prev, [submission.id]: '' }));
    setSuccessMsg((prev) => ({ ...prev, [submission.id]: '' }));
    try {
      const res = await fetch('/api/admin/contact-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: submission.id, replyMessage: text }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to send');
      setSubmissions((prev) => prev.map((s) => s.id === submission.id ? { ...s, replied: true, repliedAt: new Date().toISOString() } : s));
      setReplyText((prev) => ({ ...prev, [submission.id]: '' }));
      setSuccessMsg((prev) => ({ ...prev, [submission.id]: 'Email sent successfully!' }));
    } catch (err: unknown) {
      setSendError((prev) => ({ ...prev, [submission.id]: err instanceof Error ? err.message : 'Failed to send.' }));
    }
    setSending(null);
  }

  async function saveAdminNotes(id: string) {
    const notes = adminNotes[id]?.trim();
    if (!notes) return;
    try {
      await fetch('/api/admin/contact-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, adminNotes: notes }),
        credentials: 'include',
      });
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, adminNotes: notes } : s));
    } catch (err) {
      console.error('[contact-submissions] Error saving notes:', err);
    }
  }

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (typeFilter !== 'all' && s.enquiryType !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.subject.toLowerCase().includes(q) ||
      s.message.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] flex items-center gap-2">
            <Mail size={20} className="text-[#C8A75E]" />
            Contact Submissions
          </h1>
          <p className="text-xs text-[#AAB0D6]/60 mt-1">View and respond to contact form enquiries</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-[#AAB0D6] text-sm hover:bg-white/5 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Mail size={14} />} label="Total" value={stats.total} color="text-[#F5F3EE]" />
        <StatCard icon={<Clock size={14} />} label="New" value={stats.new} color="text-blue-400" />
        <StatCard icon={<CheckCircle2 size={14} />} label="Replied" value={stats.replied} color="text-emerald-400" />
        <StatCard icon={<Flag size={14} />} label="Complaints" value={stats.complaint} color="text-rose-400" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AAB0D6]/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, subject..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0A0C14] border border-white/10 text-[#F5F3EE] text-sm placeholder:text-[#AAB0D6]/30 focus:outline-none focus:border-[#C8A75E]/40 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
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

      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            typeFilter === 'all'
              ? 'bg-[#C8A75E]/10 border-[#C8A75E]/25 text-[#C8A75E]'
              : 'border-white/8 text-[#AAB0D6]/60 hover:text-[#AAB0D6] hover:border-white/12'
          }`}
        >
          All Types
        </button>
        {Object.entries(ENQUIRY_TYPE_STYLES).map(([key, style]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 ${
              typeFilter === key
                ? style.bg + ' ' + style.color
                : 'border-white/8 text-[#AAB0D6]/60 hover:text-[#AAB0D6] hover:border-white/12'
            }`}
          >
            {style.icon}
            {style.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="w-5 h-5 text-[#C8A75E]/40 animate-spin" />
          <span className="text-sm text-[#AAB0D6]/50">Loading submissions...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#AAB0D6]/40">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((submission) => {
            const isExpanded = expanded === submission.id;
            const statusStyle = STATUS_STYLES[submission.status] || STATUS_STYLES.new;
            const typeStyle = ENQUIRY_TYPE_STYLES[submission.enquiryType] || ENQUIRY_TYPE_STYLES.general;

            return (
              <div key={submission.id} className="bg-[#0B0F2A] border border-white/8 rounded-2xl overflow-hidden">
                <div
                  className="flex items-start gap-4 p-5 cursor-pointer hover:bg-white/2 transition-colors"
                  onClick={() => toggleExpand(submission.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-sm font-semibold text-[#F5F3EE]">{submission.fullName}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.color}`}>
                        {statusStyle.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeStyle.bg} ${typeStyle.color}`}>
                        {typeStyle.icon}
                        {typeStyle.label}
                      </span>
                      {submission.replied && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-emerald-400/10 border-emerald-400/20 text-emerald-400">
                          <CheckCircle2 size={10} />
                          Replied
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#AAB0D6]/50">{submission.email}</p>
                    <h3 className="text-sm font-medium text-[#F5F3EE] mt-1">{submission.subject}</h3>
                    <p className="text-[10px] text-[#AAB0D6]/30 mt-1">{timeAgo(submission.createdAt)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#AAB0D6]/30" /> : <ChevronDown className="w-4 h-4 text-[#AAB0D6]/30" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 p-5 space-y-5">
                    <div>
                      <p className="text-[10px] text-[#AAB0D6]/30 uppercase tracking-widest mb-2">Message</p>
                      <p className="text-sm text-[#AAB0D6] leading-relaxed whitespace-pre-wrap bg-[#0A0C14]/60 rounded-xl p-4 border border-white/5">
                        {submission.message}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#AAB0D6]/40">Full Name:</span>
                        <span className="text-[#F5F3EE] ml-2">{submission.fullName}</span>
                      </div>
                      <div>
                        <span className="text-[#AAB0D6]/40">Email:</span>
                        <span className="text-[#F5F3EE] ml-2">{submission.email}</span>
                      </div>
                      <div>
                        <span className="text-[#AAB0D6]/40">Submitted:</span>
                        <span className="text-[#F5F3EE] ml-2">{formatDate(submission.createdAt)}</span>
                      </div>
                      {submission.repliedAt && (
                        <div>
                          <span className="text-[#AAB0D6]/40">Replied:</span>
                          <span className="text-emerald-400 ml-2">{formatDate(submission.repliedAt)}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] text-[#AAB0D6]/30 uppercase tracking-widest mb-2">Admin Notes</p>
                      <textarea
                        value={adminNotes[submission.id] ?? submission.adminNotes ?? ''}
                        onChange={(e) => setAdminNotes((prev) => ({ ...prev, [submission.id]: e.target.value }))}
                        rows={2}
                        placeholder="Add internal notes..."
                        className="w-full px-4 py-3 rounded-xl bg-[#0A0C14] border border-white/8 text-[#F5F3EE] text-sm placeholder:text-[#AAB0D6]/25 focus:outline-none focus:border-[#C8A75E]/40 transition-all resize-none mb-2"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => saveAdminNotes(submission.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#AAB0D6] text-xs font-medium hover:bg-white/10 transition-all"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-xs text-[#AAB0D6]/50 flex-shrink-0">Change status:</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(submission.id, s)}
                            disabled={submission.status === s || updating === submission.id}
                            className={`text-[10px] px-2.5 py-1 rounded-md border transition-all font-medium disabled:opacity-40 ${
                              submission.status === s
                                ? `${STATUS_STYLES[s].bg} ${STATUS_STYLES[s].color}`
                                : 'border-white/8 text-[#AAB0D6]/50 hover:border-white/15 hover:text-[#AAB0D6]'
                            }`}
                          >
                            {updating === submission.id && submission.status !== s ? (
                              <Loader2 className="w-3 h-3 animate-spin inline" />
                            ) : (
                              STATUS_STYLES[s]?.label ?? s
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-[#AAB0D6]/30 uppercase tracking-widest mb-2">Send Reply Email</p>
                      <textarea
                        value={replyText[submission.id] || ''}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [submission.id]: e.target.value }))}
                        rows={4}
                        placeholder="Type your reply to the user..."
                        className="w-full px-4 py-3 rounded-xl bg-[#0A0C14] border border-white/8 text-[#F5F3EE] text-sm placeholder:text-[#AAB0D6]/25 focus:outline-none focus:border-[#C8A75E]/40 transition-all resize-none mb-2"
                      />
                      {sendError[submission.id] && (
                        <div className="flex items-center gap-2 text-rose-400 text-xs mb-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {sendError[submission.id]}
                        </div>
                      )}
                      {successMsg[submission.id] && (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {successMsg[submission.id]}
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={() => sendReply(submission)}
                          disabled={!replyText[submission.id]?.trim() || sending === submission.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C8A75E]/12 border border-[#C8A75E]/25 text-[#C8A75E] text-xs font-semibold hover:bg-[#C8A75E]/18 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {sending === submission.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          {sending === submission.id ? 'Sending...' : 'Send Reply'}
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
        Showing {filtered.length} of {submissions.length} submissions
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-[#0B0F2A] border border-white/8 rounded-xl p-4">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-[#AAB0D6]/50 mt-0.5">{label}</div>
    </div>
  );
}
