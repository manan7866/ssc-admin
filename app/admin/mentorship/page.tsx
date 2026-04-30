'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronDown, ChevronUp, RefreshCw, Calendar } from 'lucide-react';

type Status = 'all' | 'pending' | 'under_review' | 'interview_scheduled' | 'accepted' | 'declined' | 'withdrawn';

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  backgroundSummary: string;
  spiritualGoals: string;
  relevantExperience: string | null;
  whyThisProgram: string;
  commitmentLevel: string;
  availability: string;
  previousMentorshipExperience: string | null;
  status: string;
  reviewerNotes: string | null;
  interviewScheduledFor: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'under_review', 'interview_scheduled', 'accepted', 'declined', 'withdrawn'];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  under_review: 'bg-blue-500/15 text-blue-400',
  interview_scheduled: 'bg-teal-500/15 text-teal-400',
  accepted: 'bg-emerald-500/15 text-emerald-400',
  declined: 'bg-red-500/15 text-red-400',
  withdrawn: 'bg-white/10 text-[#AAB0D6]',
};

export default function MentorshipAdminPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Status>('all');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [interviewDate, setInterviewDate] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/mentorship');
    const data = await res.json();
    setApps(data.applications ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    await fetch('/api/admin/mentorship', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status,
        reviewerNotes: notes[id] ?? null,
        interviewScheduledFor: status === 'interview_scheduled' && interviewDate[id] ? interviewDate[id] : undefined,
      }),
    });
    await load();
    setSaving(null);
  }

  const filteredApps = apps.filter(a => filter === 'all' || a.status === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] flex items-center gap-2">
            <BookOpen size={20} className="text-[#C8A75E]" />
            Mentorship Applications
          </h1>
          <p className="text-[#AAB0D6] text-sm mt-1">{apps.length} total</p>
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
            {s === 'all' ? `All (${apps.length})` : `${s.replace(/_/g, ' ')} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-[#C8A75E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-16 text-[#AAB0D6]">No applications found</div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map(app => (
            <div key={app.id} className="bg-[#0B0F2A] border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div>
                  <div className="text-sm font-medium text-[#F5F3EE]">{app.fullName}</div>
                  <div className="text-xs text-[#AAB0D6] mt-0.5">{app.email} — {app.commitmentLevel}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {app.interviewScheduledFor && (
                    <span className="flex items-center gap-1 text-xs text-teal-400">
                      <Calendar size={11} />
                      {new Date(app.interviewScheduledFor).toLocaleDateString()}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[app.status] ?? 'bg-white/10 text-white'}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  {expanded === app.id ? <ChevronUp size={14} className="text-[#AAB0D6]" /> : <ChevronDown size={14} className="text-[#AAB0D6]" />}
                </div>
              </button>

              {expanded === app.id && (
                <div className="border-t border-white/10 px-5 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-[#AAB0D6] text-xs mb-1">Background</div>
                      <p className="text-[#F5F3EE]">{app.backgroundSummary}</p>
                    </div>
                    <div>
                      <div className="text-[#AAB0D6] text-xs mb-1">Spiritual Goals</div>
                      <p className="text-[#F5F3EE]">{app.spiritualGoals}</p>
                    </div>
                    <div>
                      <div className="text-[#AAB0D6] text-xs mb-1">Why This Program</div>
                      <p className="text-[#F5F3EE]">{app.whyThisProgram}</p>
                    </div>
                    <div>
                      <div className="text-[#AAB0D6] text-xs mb-1">Availability</div>
                      <p className="text-[#F5F3EE]">{app.availability}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#AAB0D6] mb-1.5">Reviewer Notes</label>
                      <textarea
                        value={notes[app.id] ?? app.reviewerNotes ?? ''}
                        onChange={e => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] resize-none focus:outline-none focus:border-[#C8A75E]/50"
                        placeholder="Internal notes..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#AAB0D6] mb-1.5">Schedule Interview</label>
                      <input
                        type="datetime-local"
                        value={interviewDate[app.id] ?? app.interviewScheduledFor?.slice(0, 16) ?? ''}
                        onChange={e => setInterviewDate(prev => ({ ...prev, [app.id]: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.filter(s => s !== app.status).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(app.id, s)}
                        disabled={saving === app.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          s === 'accepted'
                            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            : s === 'declined'
                            ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                            : s === 'interview_scheduled'
                            ? 'bg-teal-500/15 text-teal-400 hover:bg-teal-500/25'
                            : s === 'under_review'
                            ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
                            : 'bg-white/10 text-[#AAB0D6] hover:bg-white/15'
                        }`}
                      >
                        {saving === app.id ? 'Saving...' : `Mark ${s.replace(/_/g, ' ')}`}
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
