'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Plus, Search, CreditCard as Edit2, Trash2, X, Save, RefreshCw, Globe, Mail, MapPin, CircleCheck as CheckCircle2, Clock, Archive, Eye, Loader as Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface ConferenceEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  theme: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  location_detail: string | null;
  submission_deadline: string | null;
  registration_deadline: string | null;
  is_active: boolean;
  is_open_for_submissions: boolean;
  is_open_for_registration: boolean;
  max_submissions: number | null;
  submission_types: string[];
  contact_email: string | null;
  website_url: string | null;
  cover_image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-[#AAB0D6]/60', bg: 'bg-white/4 border-white/8' },
  published: { label: 'Published', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  archived: { label: 'Archived', color: 'text-[#AAB0D6]/30', bg: 'bg-white/2 border-white/5' },
};

const ALL_SUBMISSION_TYPES = [
  { value: 'paper', label: 'Research Paper' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'panel', label: 'Panel Discussion' },
  { value: 'poster', label: 'Poster Presentation' },
  { value: 'keynote', label: 'Keynote Talk' },
  { value: 'lightning', label: 'Lightning Talk' },
];

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function emptyForm(): Partial<ConferenceEvent> {
  return {
    title: '', slug: '', subtitle: '', theme: '', description: '',
    start_date: '', end_date: '', location: '', location_detail: '',
    submission_deadline: '', registration_deadline: '',
    is_active: false, is_open_for_submissions: false, is_open_for_registration: false,
    max_submissions: undefined, submission_types: ['paper', 'workshop', 'panel', 'poster'],
    contact_email: '', website_url: '', cover_image_url: '',
    status: 'draft',
  };
}

function toInputDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function toInputDatetime(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-all flex-shrink-0 ${
          checked ? 'bg-[#C8A75E]' : 'bg-white/10'
        }`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`} />
      </div>
      <span className="text-xs text-[#AAB0D6] group-hover:text-[#F5F3EE] transition-colors">{label}</span>
    </label>
  );
}

export default function ConferenceEventsAdminPage() {
  const [events, setEvents] = useState<ConferenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConferenceEvent | null>(null);
  const [form, setForm] = useState<Partial<ConferenceEvent>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [section, setSection] = useState<'basic' | 'dates' | 'settings'>('basic');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/conference-event');
    const data = await res.json();
    setEvents(data.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setSection('basic');
    setModalOpen(true);
  }

  function openEdit(ev: ConferenceEvent) {
    setEditing(ev);
    setForm({ ...ev });
    setSection('basic');
    setModalOpen(true);
  }

  function setField<K extends keyof ConferenceEvent>(key: K, value: ConferenceEvent[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.title?.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug?.trim() || generateSlug(form.title.trim()),
      subtitle: form.subtitle?.trim() || null,
      theme: form.theme?.trim() || null,
      description: form.description?.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      location: form.location?.trim() || null,
      location_detail: form.location_detail?.trim() || null,
      submission_deadline: form.submission_deadline || null,
      registration_deadline: form.registration_deadline || null,
      is_active: form.is_active ?? false,
      is_open_for_submissions: form.is_open_for_submissions ?? false,
      is_open_for_registration: form.is_open_for_registration ?? false,
      max_submissions: form.max_submissions ? Number(form.max_submissions) : null,
      submission_types: form.submission_types ?? [],
      contact_email: form.contact_email?.trim() || null,
      website_url: form.website_url?.trim() || null,
      cover_image_url: form.cover_image_url?.trim() || null,
      status: form.status ?? 'draft',
    };

    await fetch('/api/admin/conference-event', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
    });
    setModalOpen(false);
    await load();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Archive this conference event?')) return;
    setDeleting(id);
    await fetch('/api/admin/conference-event', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'archived' }),
    });
    await load();
    setDeleting(null);
  }

  async function toggleActive(ev: ConferenceEvent) {
    await fetch('/api/admin/conference-event', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ev.id, is_active: !ev.is_active }),
    });
    await load();
  }

  const filtered = events.filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return e.title.toLowerCase().includes(s) || e.slug.toLowerCase().includes(s) || (e.theme?.toLowerCase() ?? '').includes(s);
  });

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] flex items-center gap-2">
            <CalendarDays size={20} className="text-[#C8A75E]" />
            Conference Events
          </h1>
          <p className="text-[#AAB0D6] text-sm mt-1">Create and manage symposium events for the front-end submission portal</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors p-2">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8A75E] text-[#080A18] rounded-lg text-sm font-medium hover:bg-[#D4B86A] transition-colors"
          >
            <Plus size={15} />
            New Conference
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAB0D6]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conferences..."
          className="w-full bg-[#0B0F2A] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F5F3EE] placeholder-[#AAB0D6]/50 focus:outline-none focus:border-[#C8A75E]/50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-[#C8A75E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-[#AAB0D6]/20" />
          <p className="text-[#AAB0D6]/50 text-sm">No conference events yet.</p>
          <button onClick={openCreate} className="mt-3 text-[#C8A75E] text-sm hover:underline">Create your first conference</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ev) => {
            const statusStyle = STATUS_STYLES[ev.status] || STATUS_STYLES.draft;
            const isExpanded = expanded === ev.id;
            return (
              <div key={ev.id} className="bg-[#0B0F2A] border border-white/8 rounded-xl overflow-hidden">
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.color}`}>
                        {statusStyle.label}
                      </span>
                      {ev.is_active && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#C8A75E]/10 border border-[#C8A75E]/20 text-[#C8A75E]">
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-[#F5F3EE]">{ev.title}</h3>
                    {ev.theme && <p className="text-xs text-[#AAB0D6]/60 mt-0.5">{ev.theme}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#AAB0D6]/30">
                      {ev.start_date && <span>{ev.start_date}</span>}
                      {ev.location && <><span>·</span><span>{ev.location}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(ev)}
                      title={ev.is_active ? 'Deactivate' : 'Set as active'}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all ${
                        ev.is_active
                          ? 'bg-[#C8A75E]/12 border-[#C8A75E]/25 text-[#C8A75E]'
                          : 'border-white/8 text-[#AAB0D6]/40 hover:text-[#AAB0D6] hover:border-white/15'
                      }`}
                    >
                      {ev.is_active ? 'Active' : 'Set Active'}
                    </button>
                    <button
                      onClick={() => openEdit(ev)}
                      className="p-1.5 text-[#AAB0D6] hover:text-[#C8A75E] hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      disabled={deleting === ev.id}
                      className="p-1.5 text-[#AAB0D6] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {deleting === ev.id ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : ev.id)}
                      className="p-1.5 text-[#AAB0D6]/30 hover:text-[#AAB0D6] rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {[
                      { label: 'Submissions Open', value: ev.is_open_for_submissions ? 'Yes' : 'No', highlight: ev.is_open_for_submissions },
                      { label: 'Registration Open', value: ev.is_open_for_registration ? 'Yes' : 'No', highlight: ev.is_open_for_registration },
                      { label: 'Submission Deadline', value: ev.submission_deadline ? ev.submission_deadline.slice(0, 10) : '—', highlight: false },
                      { label: 'Registration Deadline', value: ev.registration_deadline ? ev.registration_deadline.slice(0, 10) : '—', highlight: false },
                      { label: 'Max Submissions', value: ev.max_submissions ? String(ev.max_submissions) : 'Unlimited', highlight: false },
                      { label: 'Submission Types', value: (ev.submission_types || []).join(', ') || '—', highlight: false },
                    ].map((item) => (
                      <div key={item.label} className="bg-white/2 rounded-lg p-2.5 border border-white/4">
                        <p className="text-[10px] text-[#AAB0D6]/30 uppercase tracking-widest mb-0.5">{item.label}</p>
                        <p className={item.highlight ? 'text-emerald-400' : 'text-[#AAB0D6]'}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0B0F2A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0B0F2A] z-10">
              <h2 className="text-sm font-semibold text-[#F5F3EE]">
                {editing ? 'Edit Conference' : 'New Conference Event'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#AAB0D6] hover:text-[#F5F3EE]">
                <X size={16} />
              </button>
            </div>

            <div className="flex border-b border-white/8 sticky top-[57px] bg-[#0B0F2A] z-10">
              {(['basic', 'dates', 'settings'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                    section === s ? 'text-[#C8A75E] border-b-2 border-[#C8A75E]' : 'text-[#AAB0D6]/50 hover:text-[#AAB0D6]'
                  }`}
                >
                  {s === 'basic' ? 'Basic Info' : s === 'dates' ? 'Dates & Location' : 'Settings'}
                </button>
              ))}
            </div>

            <div className="px-6 py-5 space-y-4">
              {section === 'basic' && (
                <>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Conference Title *</label>
                    <input
                      value={form.title ?? ''}
                      onChange={(e) => { setField('title', e.target.value); if (!editing) setField('slug', generateSlug(e.target.value)); }}
                      placeholder="e.g. Sufi Science Symposium 2026"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Slug</label>
                    <input
                      value={form.slug ?? ''}
                      onChange={(e) => setField('slug', e.target.value)}
                      placeholder="auto-generated from title"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] font-mono focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Subtitle</label>
                    <input
                      value={form.subtitle ?? ''}
                      onChange={(e) => setField('subtitle', e.target.value)}
                      placeholder="Optional tagline"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Theme</label>
                    <input
                      value={form.theme ?? ''}
                      onChange={(e) => setField('theme', e.target.value)}
                      placeholder="e.g. Bridging Ancient Wisdom and Modern Science"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Description</label>
                    <textarea
                      value={form.description ?? ''}
                      onChange={(e) => setField('description', e.target.value)}
                      rows={4}
                      placeholder="Full conference description shown on the front-end page"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] resize-none focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Cover Image URL</label>
                    <input
                      value={form.cover_image_url ?? ''}
                      onChange={(e) => setField('cover_image_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Status</label>
                    <div className="flex gap-2">
                      {(['draft', 'published', 'archived'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setField('status', s)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg border capitalize transition-all ${
                            form.status === s
                              ? 'bg-[#C8A75E]/12 border-[#C8A75E]/30 text-[#C8A75E]'
                              : 'border-white/8 text-[#AAB0D6]/50 hover:border-white/15 hover:text-[#AAB0D6]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {section === 'dates' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#AAB0D6] mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={toInputDate(form.start_date)}
                        onChange={(e) => setField('start_date', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#AAB0D6] mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={toInputDate(form.end_date)}
                        onChange={(e) => setField('end_date', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Submission Deadline</label>
                    <input
                      type="datetime-local"
                      value={toInputDatetime(form.submission_deadline)}
                      onChange={(e) => setField('submission_deadline', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Registration Deadline</label>
                    <input
                      type="datetime-local"
                      value={toInputDatetime(form.registration_deadline)}
                      onChange={(e) => setField('registration_deadline', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Location</label>
                    <input
                      value={form.location ?? ''}
                      onChange={(e) => setField('location', e.target.value)}
                      placeholder="e.g. Washington D.C. / Virtual"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Location Detail</label>
                    <input
                      value={form.location_detail ?? ''}
                      onChange={(e) => setField('location_detail', e.target.value)}
                      placeholder="Full address or virtual meeting link"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Contact Email</label>
                    <input
                      type="email"
                      value={form.contact_email ?? ''}
                      onChange={(e) => setField('contact_email', e.target.value)}
                      placeholder="conference@example.org"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Website URL</label>
                    <input
                      value={form.website_url ?? ''}
                      onChange={(e) => setField('website_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>
                </>
              )}

              {section === 'settings' && (
                <>
                  <div className="space-y-3">
                    <p className="text-xs text-[#AAB0D6]/50 uppercase tracking-widest">Visibility</p>
                    <Toggle
                      checked={form.is_active ?? false}
                      onChange={(v) => setField('is_active', v)}
                      label="Set as active conference (shown on front-end)"
                    />
                    <Toggle
                      checked={form.is_open_for_submissions ?? false}
                      onChange={(v) => setField('is_open_for_submissions', v)}
                      label="Open for paper/talk submissions"
                    />
                    <Toggle
                      checked={form.is_open_for_registration ?? false}
                      onChange={(v) => setField('is_open_for_registration', v)}
                      label="Open for attendee registration"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-1.5">Max Submissions (leave blank for unlimited)</label>
                    <input
                      type="number"
                      value={form.max_submissions ?? ''}
                      onChange={(e) => setField('max_submissions', e.target.value ? Number(e.target.value) : null as unknown as number)}
                      min={1}
                      placeholder="Unlimited"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#AAB0D6] mb-2">Accepted Submission Types</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ALL_SUBMISSION_TYPES.map((t) => {
                        const selected = (form.submission_types || []).includes(t.value);
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => {
                              const current = form.submission_types || [];
                              setField('submission_types', selected
                                ? current.filter((x) => x !== t.value)
                                : [...current, t.value]);
                            }}
                            className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
                              selected
                                ? 'bg-[#C8A75E]/12 border-[#C8A75E]/30 text-[#C8A75E]'
                                : 'border-white/8 text-[#AAB0D6]/50 hover:border-white/15 hover:text-[#AAB0D6]'
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center sticky bottom-0 bg-[#0B0F2A]">
              <div className="flex gap-1">
                {(['basic', 'dates', 'settings'] as const).map((s, i) => (
                  <div key={s} className={`w-2 h-2 rounded-full transition-all ${section === s ? 'bg-[#C8A75E]' : 'bg-white/15'}`} />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title?.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C8A75E] text-[#080A18] rounded-lg text-sm font-medium hover:bg-[#D4B86A] transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Conference')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
