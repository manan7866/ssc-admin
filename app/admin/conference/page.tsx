'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CircleCheck as CheckCircle2, Clock, Eye, CircleAlert as AlertCircle, RotateCcw, FileText, Search, ChevronDown, ChevronUp, ExternalLink, Loader as Loader2, X, Users, Filter, ArrowLeft } from 'lucide-react';

type SubmissionStatus = 'submitted' | 'under_review' | 'revision_requested' | 'accepted' | 'rejected' | 'withdrawn';

interface Submission {
  id: string;
  trackingCode: string;
  submissionType: string;
  title: string;
  abstract: string;
  keywords: string[] | null;
  presenterName: string;
  presenterEmail: string;
  presenterAffiliation: string;
  presenterBio: string;
  coPresenters: Array<{ name: string; email: string; affiliation: string }>;
  fileUrl: string | null;
  fileName: string | null;
  status: SubmissionStatus;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  submittedAt: string;
  updatedAt: string;
  conference?: {
    id: string;
    title: string;
    location_detail: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  submitted: { label: 'Submitted', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
  under_review: { label: 'Under Review', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
  revision_requested: { label: 'Revision Requested', color: 'text-orange-400', dot: 'bg-orange-400' },
  accepted: { label: 'Accepted', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  rejected: { label: 'Not Accepted', color: 'text-red-400', dot: 'bg-red-400' },
  withdrawn: { label: 'Withdrawn', color: 'text-[#AAB0D6]/40', dot: 'bg-[#AAB0D6]/40' },
};

function StatusDot({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ReviewPanel({
  submission,
  onUpdate,
  onClose,
}: {
  submission: Submission;
  onUpdate: (id: string, updates: Partial<Submission>) => Promise<void>;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const [notes, setNotes] = useState(submission.adminNotes || '');
  const [reviewedBy, setReviewedBy] = useState(submission.reviewedBy || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onUpdate(submission.id, {
      status,
      adminNotes: notes,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0A0C18] border-l border-white/8 z-50 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div>
          <p className="text-xs text-[#AAB0D6]/40 uppercase tracking-widest mb-0.5">Review Panel</p>
          <p className="font-mono text-sm text-[#C8A75E] font-bold">{submission.trackingCode}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#AAB0D6]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div>
          <h3 className="font-serif font-semibold text-[#F5F3EE] leading-snug mb-1">{submission.title}</h3>
          <p className="text-xs text-[#AAB0D6]/50">{submission.presenterName} — {submission.presenterAffiliation}</p>
          <p className="text-[10px] text-[#AAB0D6]/30 mt-1">{submission.presenterEmail}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/2 border border-white/5">
          <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-2">Abstract</p>
          <p className="text-xs text-[#AAB0D6] leading-relaxed">{submission.abstract}</p>
        </div>

        {submission.keywords && Array.isArray(submission.keywords) && submission.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {submission.keywords.map((kw , idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#C8A75E]/8 border border-[#C8A75E]/15 text-[#C8A75E]">
                {kw}
              </span>
            ))}
          </div>
        )}

        {submission.presenterBio && (
          <div className="p-4 rounded-xl bg-white/2 border border-white/5">
            <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-2">Presenter Bio</p>
            <p className="text-xs text-[#AAB0D6] leading-relaxed">{submission.presenterBio}</p>
          </div>
        )}

        {submission.coPresenters && submission.coPresenters.length > 0 && (
          <div>
            <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-2">Co-Presenters</p>
            {submission.coPresenters.map((cp, i) => (
              <p key={i} className="text-xs text-[#AAB0D6]">{cp.name} — {cp.email}</p>
            ))}
          </div>
        )}

        {submission.fileUrl && (
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#6B9BD1] hover:text-[#6B9BD1]/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {submission.fileName || 'View Uploaded File'}
          </a>
        )}

        <div className="border-t border-white/5 pt-5 space-y-4">
          <p className="text-xs font-semibold text-[#F5F3EE] uppercase tracking-widest">Editorial Decision</p>

          <div>
            <label className="block text-xs text-[#AAB0D6] mb-1.5">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as SubmissionStatus)}>
              <SelectTrigger className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs text-[#AAB0D6] mb-1.5">Reviewer Name</label>
            <Input
              value={reviewedBy}
              onChange={(e) => setReviewedBy(e.target.value)}
              className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm focus:border-[#C8A75E]"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs text-[#AAB0D6] mb-1.5">Reviewer Notes (visible to submitter)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm focus:border-[#C8A75E] min-h-[100px]"
              placeholder="Feedback, revision requests, or acceptance notes..."
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/5">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#C8A75E] text-[#0B0F2A] hover:bg-[#C8A75E]/90 font-semibold"
        >
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> :
           saved ? <><CheckCircle2 className="w-4 h-4 mr-2" />Saved</> :
           'Save Decision'}
        </Button>
      </div>
    </div>
  );
}

export default function AdminConferencePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/conference');
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  async function handleUpdate(id: string, updates: Partial<Submission>) {
    await fetch('/api/admin/conference', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status: updates.status,
        adminNotes: updates.adminNotes,
        reviewedBy: updates.reviewedBy,
        reviewedAt: updates.reviewedAt,
      }),
    });
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, ...updates } : null);
  }

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) ||
      s.presenterName.toLowerCase().includes(q) ||
      s.trackingCode.toLowerCase().includes(q) ||
      s.presenterEmail.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchType = typeFilter === 'all' || s.submissionType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const counts = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    under_review: submissions.filter(s => s.status === 'under_review').length,
    accepted: submissions.filter(s => s.status === 'accepted').length,
  };

  const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    submitted: Clock,
    under_review: Eye,
    revision_requested: RotateCcw,
    accepted: CheckCircle2,
    rejected: AlertCircle,
    withdrawn: FileText,
  };

  return (
    <div className="min-h-screen bg-[#08091A] text-[#F5F3EE]">
      <div className="border-b border-white/5 bg-[#0A0C18]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-[#AAB0D6]/40 hover:text-[#C8A75E] transition-colors text-xs mb-1">
              <ArrowLeft className="w-3 h-3" />
              Admin
            </Link>
            <h1 className="text-xl font-serif font-bold text-[#F5F3EE]">Conference Submission Review</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#AAB0D6]/40">Sufi Science Symposium 2026</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSubmissions}
              className="text-[#AAB0D6] hover:text-[#C8A75E] text-xs"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: counts.total, icon: Users, color: '#AAB0D6' },
            { label: 'New', value: counts.submitted, icon: Clock, color: '#6B9BD1' },
            { label: 'In Review', value: counts.under_review, icon: Eye, color: '#C8A75E' },
            { label: 'Accepted', value: counts.accepted, icon: CheckCircle2, color: '#27AE60' },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="glass-panel border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${m.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: m.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-wide">{m.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <Search className="w-4 h-4 text-[#AAB0D6]/40 flex-shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm focus:border-[#C8A75E]"
              placeholder="Search by title, name, email, or code..."
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
              <Filter className="w-3.5 h-3.5 mr-2 text-[#AAB0D6]/40" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="paper">Research Paper</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="panel">Panel</SelectItem>
              <SelectItem value="poster">Poster</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#C8A75E] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#AAB0D6]/30 text-sm">No submissions found.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((sub) => {
              const StatusIcon = ICONS[sub.status] || FileText;
              const isExpanded = expanded === sub.id;
              return (
                <div
                  key={sub.id}
                  className="glass-panel border border-white/5 hover:border-white/10 rounded-xl transition-all overflow-hidden"
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-8 h-8 rounded-lg bg-white/3 flex items-center justify-center flex-shrink-0">
                      <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[sub.status]?.color || 'text-[#AAB0D6]'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                        <p className="font-mono text-xs text-[#C8A75E]/60">{sub.trackingCode}</p>
                        <StatusDot status={sub.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#F5F3EE] truncate">{sub.title}</p>
                      <p className="text-xs text-[#AAB0D6]/50">{sub.presenterName} · {sub.presenterAffiliation}</p>
                    </div>
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <p className="text-xs text-[#AAB0D6]/40 capitalize">{sub.submissionType}</p>
                      <p className="text-[10px] text-[#AAB0D6]/25">{formatDate(sub.submittedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => setSelected(sub)}
                        className="bg-[#C8A75E]/10 text-[#C8A75E] hover:bg-[#C8A75E]/20 border border-[#C8A75E]/20 text-xs px-3 h-7"
                      >
                        Review
                      </Button>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : sub.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#AAB0D6]/40"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                      <p className="text-xs text-[#AAB0D6]/40 uppercase tracking-widest mb-2">Abstract</p>
                      <p className="text-xs text-[#AAB0D6] leading-relaxed mb-4">{sub.abstract}</p>
                      {sub.adminNotes && (
                        <div className="p-3 rounded-lg bg-[#C8A75E]/5 border border-[#C8A75E]/15">
                          <p className="text-[10px] text-[#C8A75E]/50 uppercase tracking-widest mb-1">Reviewer Notes</p>
                          <p className="text-xs text-[#AAB0D6]">{sub.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <ReviewPanel
            submission={selected}
            onUpdate={handleUpdate}
            onClose={() => setSelected(null)}
          />
        </>
      )}
    </div>
  );
}
