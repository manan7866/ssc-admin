'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, ChevronDown, ChevronUp, RefreshCw, ExternalLink } from 'lucide-react';

type Status = 'all' | 'pending' | 'under_review' | 'approved' | 'declined';

interface Proposal {
  id: string;
  organizationName: string;
  organizationType: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  proposalSummary: string;
  proposalDetails: string;
  collaborationType: string;
  scope: string;
  timeline: string;
  attachmentUrls: string[];
  status: string;
  notes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'under_review', 'approved', 'declined'];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  under_review: 'bg-blue-500/15 text-blue-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  declined: 'bg-red-500/15 text-red-400',
};

export default function CollaborationAdminPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filter, setFilter] = useState<Status>('all');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const url = filter !== 'all' ? `/api/admin/collaboration?status=${filter}` : '/api/admin/collaboration';
    const res = await fetch(url);
    const data = await res.json();
    setProposals(data.proposals ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    await fetch('/api/admin/collaboration', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, notes: notes[id] ?? null }),
    });
    await load();
    setSaving(null);
  }

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = proposals.filter(p => p.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] flex items-center gap-2">
            <Building2 size={20} className="text-[#C8A75E]" />
            Collaboration Proposals
          </h1>
          <p className="text-[#AAB0D6] text-sm mt-1">{proposals.length} total</p>
        </div>
        <button onClick={load} className="text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', ...STATUS_OPTIONS] as Status[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-[#C8A75E] text-[#080A18]'
                : 'bg-white/5 text-[#AAB0D6] hover:bg-white/10'
            }`}
          >
            {s === 'all' ? `All (${proposals.length})` : `${s.replace('_', ' ')} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-[#C8A75E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-16 text-[#AAB0D6]">No proposals found</div>
      ) : (
        <div className="space-y-3">
          {proposals.map(p => (
            <div key={p.id} className="bg-[#0B0F2A] border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div>
                  <div className="text-sm font-medium text-[#F5F3EE]">{p.organizationName}</div>
                  <div className="text-xs text-[#AAB0D6] mt-0.5">
                    {p.contactName} — {p.collaborationType} — {p.organizationType}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status] ?? 'bg-white/10 text-white'}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                  {expanded === p.id ? <ChevronUp size={14} className="text-[#AAB0D6]" /> : <ChevronDown size={14} className="text-[#AAB0D6]" />}
                </div>
              </button>

              {expanded === p.id && (
                <div className="border-t border-white/10 px-5 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-[#AAB0D6] text-xs mb-1">Contact</div>
                      <p className="text-[#F5F3EE]">{p.contactName}</p>
                      <p className="text-[#AAB0D6] text-xs">{p.contactEmail}</p>
                      {p.contactPhone && <p className="text-[#AAB0D6] text-xs">{p.contactPhone}</p>}
                    </div>
                    <div>
                      <div className="text-[#AAB0D6] text-xs mb-1">Timeline & Scope</div>
                      <p className="text-[#F5F3EE]">{p.timeline}</p>
                      <p className="text-[#AAB0D6] text-xs mt-1">{p.scope}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[#AAB0D6] text-xs mb-1">Summary</div>
                      <p className="text-[#F5F3EE]">{p.proposalSummary}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[#AAB0D6] text-xs mb-1">Details</div>
                      <p className="text-[#F5F3EE] text-xs">{p.proposalDetails}</p>
                    </div>
                    {p.attachmentUrls && p.attachmentUrls.length > 0 && (
                      <div className="sm:col-span-2">
                        <div className="text-[#AAB0D6] text-xs mb-2">Attachments</div>
                        <div className="flex flex-wrap gap-2">
                          {p.attachmentUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-[#C8A75E] hover:underline"
                            >
                              <ExternalLink size={11} />
                              Attachment {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Review Notes</label>
                    <textarea
                      value={notes[p.id] ?? p.notes ?? ''}
                      onChange={e => setNotes(prev => ({ ...prev, [p.id]: e.target.value }))}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] resize-none focus:outline-none focus:border-[#C8A75E]/50"
                      placeholder="Internal notes..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.filter(s => s !== p.status).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(p.id, s)}
                        disabled={saving === p.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          s === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            : s === 'declined'
                            ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                            : s === 'under_review'
                            ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
                            : 'bg-white/10 text-[#AAB0D6] hover:bg-white/15'
                        }`}
                      >
                        {saving === p.id ? 'Saving...' : `Mark ${s.replace('_', ' ')}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
