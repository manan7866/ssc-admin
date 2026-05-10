'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, X, Save, RefreshCw, Loader as Loader2, ChevronDown, ChevronUp, CircleCheck as CheckCircle2, Mail, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
  'Daily Practice', 'Cognitive Development', 'Path Architecture',
  'Heart Practice', 'Contemplative Inquiry', 'Ethical Refinement',
];

const STATUS_OPTIONS = ['draft', 'under_review', 'request_revision', 'approved', 'published'];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-[#AAB0D6]/10 text-[#AAB0D6] border-[#AAB0D6]/20',
  under_review: 'bg-[#C8A75E]/10 text-[#C8A75E] border-[#C8A75E]/20',
  request_revision: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  published: 'bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20',
};

interface WazifaSubmission {
  id: string;
  userName: string;
  email: string;
  title: string;
  category: string;
  components: string[];
  ethicalFoundations: string[];
  outcomes: string[];
  description: string;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function WazifaSubmissionsAdminPage() {
  const [submissions, setSubmissions] = useState<WazifaSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [selected, setSelected] = useState<WazifaSubmission | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/cms/wazifa?${params.toString()}`, { credentials: 'include' });
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setLoading(false);
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const handleSelect = (sub: WazifaSubmission) => {
    setSelected(sub);
    setEditStatus(sub.status);
    setEditNotes(sub.reviewNotes || '');
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch('/api/admin/cms/wazifa', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: selected.id, status: editStatus, reviewNotes: editNotes }),
    });
    setSubmissions((prev) => prev.map((s) => s.id === selected.id ? { ...s, status: editStatus, reviewNotes: editNotes } : s));
    if (selected) setSelected({ ...selected, status: editStatus, reviewNotes: editNotes });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const counts = {
    total: submissions.length,
    draft: submissions.filter(s => s.status === 'draft').length,
    under_review: submissions.filter(s => s.status === 'under_review').length,
    published: submissions.filter(s => s.status === 'published').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] flex items-center gap-2">
            <FileText size={20} className="text-[#C8A75E]" />
            Wazeefia Submissions
          </h1>
          <p className="text-[#AAB0D6] text-sm mt-1">Review and manage community wazeefia submissions</p>
        </div>
        <button onClick={() => fetchSubmissions()} className="text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors p-2">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, color: '#AAB0D6' },
          { label: 'Draft', value: counts.draft, color: '#AAB0D6' },
          { label: 'Under Review', value: counts.under_review, color: '#C8A75E' },
          { label: 'Published', value: counts.published, color: '#27AE60' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl p-3 text-center border border-white/5 bg-white/2">
            <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[10px] text-[#AAB0D6]/40 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-[#AAB0D6]/40 flex-shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            placeholder="Search by title, name, or email..."
            className="w-full bg-[#0D1020] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] placeholder-[#AAB0D6]/40 focus:outline-none focus:border-[#C8A75E]/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 text-[#C8A75E] animate-spin" /></div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-[#AAB0D6]/30 text-sm">No submissions found.</div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => {
            const isExpanded = expanded === sub.id;
            return (
              <div key={sub.id} className="bg-[#0B0F2A] border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-lg bg-[#C8A75E]/12 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-[#C8A75E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/5 text-[#AAB0D6] border-white/10">{sub.category}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[sub.status] || STATUS_COLORS.draft}`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#F5F3EE] truncate">{sub.title}</p>
                    <p className="text-xs text-[#AAB0D6]/50">{sub.userName} · {sub.email}</p>
                  </div>
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="text-[10px] text-[#AAB0D6]/25">{new Date(sub.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => handleSelect(sub)} className="bg-[#C8A75E]/10 text-[#C8A75E] hover:bg-[#C8A75E]/20 border border-[#C8A75E]/20 text-xs px-3 h-7">Review</Button>
                    <button onClick={() => setExpanded(isExpanded ? null : sub.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#AAB0D6]/40">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[#AAB0D6]/30 uppercase mb-1">User</p>
                        <p className="text-xs text-[#F5F7FA]">{sub.userName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#AAB0D6]/30 uppercase mb-1">Email</p>
                        <p className="text-xs text-[#F5F7FA]">{sub.email}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#AAB0D6]/65 leading-relaxed">{sub.description}</p>
                    {sub.components?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-[#AAB0D6]/30 uppercase mb-1">Components</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sub.components.map((c, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#AAB0D6]/70">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {sub.ethicalFoundations?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-[#AAB0D6]/30 uppercase mb-1">Ethical Foundations</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sub.ethicalFoundations.map((e, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80">{e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {sub.outcomes?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-[#AAB0D6]/30 uppercase mb-1">Outcomes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sub.outcomes.map((o, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/80">{o}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {sub.reviewNotes && (
                      <div className="p-3 rounded-lg bg-[#C8A75E]/5 border border-[#C8A75E]/15">
                        <p className="text-[10px] text-[#C8A75E]/50 uppercase mb-1">Review Notes</p>
                        <p className="text-xs text-[#AAB0D6]">{sub.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0B0F2A] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-sm font-semibold text-[#F5F3EE]">Review Submission</h2>
                <p className="text-xs text-[#AAB0D6]/50 mt-0.5">{selected.title}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#AAB0D6] hover:text-[#F5F3EE]"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[#AAB0D6]/30 uppercase mb-1"><User size={10} className="inline mr-1" />User</p>
                  <p className="text-sm text-[#F5F3EE]">{selected.userName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#AAB0D6]/30 uppercase mb-1"><Mail size={10} className="inline mr-1" />Email</p>
                  <p className="text-sm text-[#F5F3EE]">{selected.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Review Notes</label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm focus:border-[#C8A75E] min-h-[100px]"
                  placeholder="Feedback, revision requests, or approval notes..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#C8A75E] text-[#080A18] rounded-lg text-sm font-medium hover:bg-[#D4B86A] transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {saving ? 'Saving...' : saved ? 'Saved' : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
