'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mic, Plus, Search, Edit2, X, Save, RefreshCw, CircleCheck as CheckCircle2, Clock, Eye, AlertCircle, Loader as Loader2, ChevronDown, ChevronUp, ExternalLink, Video, Calendar, Mail, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface InterviewApplication {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  affiliation: string | null;
  fieldOfWork: string;
  summary: string;
  themes: string[];
  links: Array<{ url: string; title: string }>;
  availability: unknown;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'rejected';
  adminNotes: string | null;
  scheduledAt: string | null;
  scheduledTime: string | null;
  videoLink: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
  scheduled: { label: 'Scheduled', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
  completed: { label: 'Completed', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'text-[#AAB0D6]/40', dot: 'bg-[#AAB0D6]/40' },
  rejected: { label: 'Rejected', color: 'text-red-400', dot: 'bg-red-400' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ReviewPanel({
  application,
  onUpdate,
  onClose,
}: {
  application: InterviewApplication;
  onUpdate: (id: string, updates: Partial<InterviewApplication>) => Promise<void>;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.adminNotes || '');
  const [scheduledAt, setScheduledAt] = useState(application.scheduledAt ? application.scheduledAt.slice(0, 10) : '');
  const [scheduledTime, setScheduledTime] = useState(application.scheduledTime || '');
  const [videoLink, setVideoLink] = useState(application.videoLink || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onUpdate(application.id, {
      status,
      adminNotes: notes,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      scheduledTime: scheduledTime || null,
      videoLink: videoLink || null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0A0C18] border-l border-white/8 z-50 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div>
          <p className="text-xs text-[#AAB0D6]/40 uppercase tracking-widest mb-0.5">Application</p>
          <p className="text-sm text-[#F5F3EE] font-medium">{application.name}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#AAB0D6]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/2 rounded-lg p-3 border border-white/5">
            <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-1">Email</p>
            <p className="text-xs text-[#AAB0D6]">{application.email}</p>
          </div>
          <div className="bg-white/2 rounded-lg p-3 border border-white/5">
            <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-1">Field of Work</p>
            <p className="text-xs text-[#AAB0D6]">{application.fieldOfWork}</p>
          </div>
        </div>

        {application.affiliation && (
          <div className="bg-white/2 rounded-lg p-3 border border-white/5">
            <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-1">Affiliation</p>
            <p className="text-xs text-[#AAB0D6]">{application.affiliation}</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-white/2 border border-white/5">
          <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-2">Summary</p>
          <p className="text-xs text-[#AAB0D6] leading-relaxed">{application.summary}</p>
        </div>

        {application.themes && application.themes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {application.themes.map((theme, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#C8A75E]/8 border border-[#C8A75E]/15 text-[#C8A75E]">
                {theme}
              </span>
            ))}
          </div>
        )}

        {application.links && application.links.length > 0 && (
          <div className="bg-white/2 rounded-lg p-3 border border-white/5">
            <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-2">Links / Resources</p>
            <div className="space-y-1">
              {application.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-[#C8A75E] hover:underline"
                >
                  {link.title || link.url}
                </a>
              ))}
            </div>
          </div>
        )}

        {application.availability !== null && application.availability !== undefined && (
          <div className="bg-white/2 rounded-lg p-3 border border-white/5">
            <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-1">Availability</p>
            <p className="text-xs text-[#AAB0D6]">{String(application.availability)}</p>
          </div>
        )}

        <div className="border-t border-white/5 pt-5 space-y-4">
          <p className="text-xs font-semibold text-[#F5F3EE] uppercase tracking-widest">Admin Actions</p>

          <div>
            <label className="block text-xs text-[#AAB0D6] mb-1.5">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as InterviewApplication['status'])}>
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

          {status === 'scheduled' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Date</label>
                  <Input
                    type="date"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Time</label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Video Link</label>
                <Input
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://zoom.us/... or https://meet.google.com/..."
                  className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-[#AAB0D6] mb-1.5">Admin Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes about this application..."
              className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm min-h-[80px]"
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
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 mr-2" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

export default function InterviewApplicationsPage() {
  const [applications, setApplications] = useState<InterviewApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<InterviewApplication | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('for', 'applications');
    
    const res = await fetch(`/api/admin/cms/insight-interviews?${params}`);
    const data = await res.json();
    setApplications(data.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function handleUpdate(id: string, updates: Partial<InterviewApplication>) {
    await fetch('/api/admin/cms/insight-interviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates, _isApplication: true }),
    });
    await fetchApplications();
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, ...updates } : null);
  }

  const filteredApplications = applications.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      return a.name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s);
    }
    return true;
  });

  const counts = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    scheduled: applications.filter(a => a.status === 'scheduled').length,
    completed: applications.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-[#08091A] text-[#F5F3EE]">
      <div className="border-b border-white/5 bg-[#0A0C18]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-[#F5F3EE] flex items-center gap-2">
              <Mic size={20} className="text-[#C8A75E]" />
              Interview Applications
            </h1>
            <p className="text-[#AAB0D6] text-sm mt-1">Review and manage interview applications</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchApplications}
              className="text-[#AAB0D6] hover:text-[#C8A75E] text-xs"
            >
              <RefreshCw size={14} className="mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: counts.total, icon: Users, color: '#AAB0D6' },
            { label: 'Pending', value: counts.pending, icon: Clock, color: '#6B9BD1' },
            { label: 'Scheduled', value: counts.scheduled, icon: Calendar, color: '#C8A75E' },
            { label: 'Completed', value: counts.completed, icon: CheckCircle2, color: '#27AE60' },
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
              placeholder="Search by name, email..."
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#C8A75E] animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-[#AAB0D6]">No applications found</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredApplications.map((app) => {
              const isExpanded = expanded === app.id;
              return (
                <div
                  key={app.id}
                  className="glass-panel border border-white/5 hover:border-white/10 rounded-xl transition-all overflow-hidden"
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-lg bg-[#C8A75E]/10 flex items-center justify-center flex-shrink-0">
                      <Mic className="w-5 h-5 text-[#C8A75E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#F5F3EE] truncate">{app.name}</p>
                      <p className="text-xs text-[#AAB0D6]/50">{app.email} · {app.fieldOfWork}</p>
                    </div>
                    <div className="hidden sm:block text-right flex-shrink-0">
                      {app.scheduledAt && (
                        <p className="text-xs text-[#C8A75E]">{formatDate(app.scheduledAt)}</p>
                      )}
                      <p className="text-[10px] text-[#AAB0D6]/25">{formatDate(app.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => setSelected(app)}
                        className="bg-[#C8A75E]/10 text-[#C8A75E] hover:bg-[#C8A75E]/20 border border-[#C8A75E]/20 text-xs px-3 h-7"
                      >
                        Review
                      </Button>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : app.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#AAB0D6]/40"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                      <p className="text-xs text-[#AAB0D6]/40 uppercase tracking-widest mb-2">Summary</p>
                      <p className="text-xs text-[#AAB0D6] leading-relaxed mb-3">{app.summary}</p>
                      {app.themes && app.themes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {app.themes.map((theme, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#C8A75E]/8 border border-[#C8A75E]/15 text-[#C8A75E]">
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                      {app.adminNotes && (
                        <div className="p-3 rounded-lg bg-[#C8A75E]/5 border border-[#C8A75E]/15">
                          <p className="text-[10px] text-[#C8A75E]/50 uppercase tracking-widest mb-1">Admin Notes</p>
                          <p className="text-xs text-[#AAB0D6]">{app.adminNotes}</p>
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
            application={selected}
            onUpdate={handleUpdate}
            onClose={() => setSelected(null)}
          />
        </>
      )}
    </div>
  );
}