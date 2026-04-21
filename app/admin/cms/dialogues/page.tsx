'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, Search, CreditCard as Edit2, Trash2, X, Save, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

interface Dialogue {
  slug : string;
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  type: string | null;
  host: string | null;
  published_at: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
  difficulty_level: string | null;
  total_episodes: number;
  total_duration_minutes: number;
  participants: string[];
  is_featured: boolean;
}

const emptyForm = (): Partial<Dialogue> => ({
  title: '',
  subtitle: '',
  description: '',
  type: 'series',
  host: '',
  is_published: false,
  difficulty_level: 'beginner',
  total_episodes: 0,
  total_duration_minutes: 0,
  participants: [],
  is_featured: false,
});

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const TYPES = ['series', 'hard_inquiry', 'insight_interview', 'applied_practice'];

export default function DialoguesAdminPage() {
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Dialogue | null>(null);
  const [form, setForm] = useState<Partial<Dialogue>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const load = useCallback(async (pageNum: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pageNum), pageSize: String(PAGE_SIZE) });
    if (search.trim()) params.set('search', search.trim());
    const res = await fetch(`/api/admin/cms/dialogues?${params}`);
    const data = await res.json();
    setDialogues(data.items ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(0); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

function openEdit(d: Dialogue) {
    setEditing(d);
    setForm({ ...d });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const slug = form.slug || generateSlug(form.title || '');
    const payload = {
      title: form.title,
      slug,
      subtitle: form.subtitle || null,
      description: form.description || null,
      type: form.type || null,
      host: form.host || null,
      is_published: form.is_published ?? false,
      published_at: form.is_published ? (form.published_at ?? new Date().toISOString()) : null,
      difficulty_level: form.difficulty_level || null,
      total_episodes: form.total_episodes ?? 0,
      total_duration_minutes: form.total_duration_minutes ?? 0,
      participants: form.participants || [],
      is_featured: form.is_featured ?? false,
    };

    await fetch('/api/admin/cms/dialogues', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
    });
    setModalOpen(false);
    await load(page);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this dialogue? This cannot be undone.')) return;
    setDeleting(id);
    await fetch('/api/admin/cms/dialogues', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load(page);
    setDeleting(null);
  }

  async function togglePublish(d: Dialogue) {
    await fetch('/api/admin/cms/dialogues', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: d.id,
        is_published: !d.is_published,
        published_at: !d.is_published ? new Date().toISOString() : null,
      }),
    });
    await load(page);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] flex items-center gap-2">
            <MessageSquare size={20} className="text-[#C8A75E]" />
            Dialogues & Series
          </h1>
          <p className="text-[#AAB0D6] text-sm mt-1">Manage dialogue series, episodes and transcripts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors p-2">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8A75E] text-[#080A18] rounded-lg text-sm font-medium hover:bg-[#D4B86A] transition-colors"
          >
            <Plus size={15} />
            Add Dialogue
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAB0D6]" />
        <input
          value={search}
          onChange={e => { const newSearch = e.target.value; setSearch(newSearch); setPage(0); load(0); }}
          placeholder="Search by title..."
          className="w-full bg-[#0B0F2A] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F5F3EE] placeholder-[#AAB0D6]/50 focus:outline-none focus:border-[#C8A75E]/50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-[#C8A75E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#0B0F2A] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider hidden lg:table-cell">Views</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#AAB0D6] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dialogues.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[#AAB0D6]">No dialogues found</td>
                </tr>
              )}
              {dialogues.map(d => (
                <tr key={d.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-[#F5F3EE] font-medium line-clamp-1">{d.title}</div>
                    {d.host && <div className="text-[#AAB0D6] text-xs mt-0.5">Host: {d.host}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 bg-white/5 text-[#AAB0D6] rounded-full text-xs">
                      {(d.type ?? '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[#AAB0D6]">{d.view_count ?? 0}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <button
                      onClick={() => togglePublish(d)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        d.is_published
                          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-white/5 text-[#AAB0D6] hover:bg-white/10'
                      }`}
                    >
                      {d.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(d)}
                        className="p-1.5 text-[#AAB0D6] hover:text-[#C8A75E] hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={deleting === d.id}
                        className="p-1.5 text-[#AAB0D6] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-[#AAB0D6]">Page {page + 1}</span>
            <div className="flex gap-2">
              <button
                onClick={() => { const newPage = Math.max(0, page - 1); setPage(newPage); load(newPage); }}
                disabled={page === 0}
                className="px-3 py-1 text-xs text-[#AAB0D6] bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10"
              >
                Previous
              </button>
              <button
                onClick={() => { const newPage = page + 1; setPage(newPage); load(newPage); }}
                disabled={dialogues.length < PAGE_SIZE}
                className="px-3 py-1 text-xs text-[#AAB0D6] bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0B0F2A] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-sm font-semibold text-[#F5F3EE]">{editing ? 'Edit Dialogue' : 'Add Dialogue'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#AAB0D6] hover:text-[#F5F3EE]">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Title *</label>
                <input
                  value={form.title ?? ''}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Type</label>
                <select
                  value={form.type ?? 'series'}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                >
                  {TYPES.map(t => (
                    <option key={t} value={t} className="bg-[#0B0F2A]">{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Host</label>
                <input
                  value={form.host ?? ''}
                  onChange={e => setForm(f => ({ ...f, host: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Subtitle</label>
                <input
                  value={form.subtitle ?? ''}
                  onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Difficulty Level</label>
                  <select
                    value={form.difficulty_level ?? 'beginner'}
                    onChange={e => setForm(f => ({ ...f, difficulty_level: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Total Episodes</label>
                  <input
                    type="number"
                    value={form.total_episodes ?? 0}
                    onChange={e => setForm(f => ({ ...f, total_episodes: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Total Duration (mins)</label>
                  <input
                    type="number"
                    value={form.total_duration_minutes ?? 0}
                    onChange={e => setForm(f => ({ ...f, total_duration_minutes: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Featured</label>
                  <input
                    type="checkbox"
                    checked={form.is_featured ?? false}
                    onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Participants (comma-separated)</label>
                <input
                  value={form.participants?.join(', ') ?? ''}
                  onChange={e => setForm(f => ({ ...f, participants: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="Name 1, Name 2"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Description</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] resize-none focus:outline-none focus:border-[#C8A75E]/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.is_published ?? false}
                  onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
                  className="rounded border-white/20"
                />
                <label htmlFor="published" className="text-sm text-[#AAB0D6]">Published</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title}
                className="flex items-center gap-2 px-4 py-2 bg-[#C8A75E] text-[#080A18] rounded-lg text-sm font-medium hover:bg-[#D4B86A] transition-colors disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
