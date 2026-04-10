'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, CreditCard as Edit2, Trash2, X, Save, RefreshCw, ExternalLink } from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  abstract: string | null;
  authors: string[] | null;
  published_year: number | null;
  journal: string | null;
  doi: string | null;
  url: string | null;
  is_featured: boolean;
  created_at: string;
}

const emptyForm = (): Partial<Paper> => ({
  title: '',
  abstract: '',
  authors: [],
  published_year: undefined,
  journal: '',
  doi: '',
  url: '',
  is_featured: false,
});

export default function ResearchAdminPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Paper | null>(null);
  const [form, setForm] = useState<Partial<Paper>>(emptyForm());
  const [authorsInput, setAuthorsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (search.trim()) params.set('search', search.trim());
    const res = await fetch(`/api/admin/cms/research?${params}`);
    const data = await res.json();
    setPapers(data.items ?? []);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setAuthorsInput('');
    setModalOpen(true);
  }

  function openEdit(paper: Paper) {
    setEditing(paper);
    setForm({ ...paper });
    setAuthorsInput((paper.authors ?? []).join(', '));
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const authors = authorsInput.split(',').map(a => a.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      abstract: form.abstract || null,
      authors,
      published_year: form.published_year ? Number(form.published_year) : null,
      journal: form.journal || null,
      doi: form.doi || null,
      url: form.url || null,
      is_featured: form.is_featured ?? false,
    };

    await fetch('/api/admin/cms/research', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
    });
    setModalOpen(false);
    await load();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this paper? This cannot be undone.')) return;
    setDeleting(id);
    await fetch('/api/admin/cms/research', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
    setDeleting(null);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] flex items-center gap-2">
            <FileText size={20} className="text-[#C8A75E]" />
            Research Papers
          </h1>
          <p className="text-[#AAB0D6] text-sm mt-1">Manage publications and academic content</p>
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
            Add Paper
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAB0D6]" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider hidden md:table-cell">Authors</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider hidden lg:table-cell">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider hidden lg:table-cell">Featured</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#AAB0D6] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {papers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[#AAB0D6]">No papers found</td>
                </tr>
              )}
              {papers.map(p => (
                <tr key={p.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-[#F5F3EE] font-medium line-clamp-1">{p.title}</div>
                    {p.journal && <div className="text-[#AAB0D6] text-xs mt-0.5">{p.journal}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#AAB0D6] text-xs">
                    {(p.authors ?? []).slice(0, 2).join(', ')}{(p.authors ?? []).length > 2 && ' et al.'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[#AAB0D6]">{p.published_year ?? '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.is_featured ? 'bg-[#C8A75E]/15 text-[#C8A75E]' : 'bg-white/5 text-[#AAB0D6]'}`}>
                      {p.is_featured ? 'Featured' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#AAB0D6] hover:text-[#C8A75E] hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-[#AAB0D6] hover:text-[#C8A75E] hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
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
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-xs text-[#AAB0D6] bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={papers.length < PAGE_SIZE}
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
              <h2 className="text-sm font-semibold text-[#F5F3EE]">{editing ? 'Edit Paper' : 'Add Paper'}</h2>
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
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Authors (comma separated)</label>
                <input
                  value={authorsInput}
                  onChange={e => setAuthorsInput(e.target.value)}
                  placeholder="Author One, Author Two"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Published Year</label>
                  <input
                    type="number"
                    value={form.published_year ?? ''}
                    onChange={e => setForm(f => ({ ...f, published_year: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Journal / Publication</label>
                  <input
                    value={form.journal ?? ''}
                    onChange={e => setForm(f => ({ ...f, journal: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">DOI</label>
                <input
                  value={form.doi ?? ''}
                  onChange={e => setForm(f => ({ ...f, doi: e.target.value }))}
                  placeholder="10.xxxx/xxxxx"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">URL</label>
                <input
                  value={form.url ?? ''}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-[#AAB0D6] mb-1.5">Abstract</label>
                <textarea
                  value={form.abstract ?? ''}
                  onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] resize-none focus:outline-none focus:border-[#C8A75E]/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-paper"
                  checked={form.is_featured ?? false}
                  onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                  className="rounded border-white/20"
                />
                <label htmlFor="featured-paper" className="text-sm text-[#AAB0D6]">Featured paper</label>
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
