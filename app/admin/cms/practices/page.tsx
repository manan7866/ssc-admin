'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Plus, Search, Edit2, Trash2, X, Save, RefreshCw, Upload, Download, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Loader as Loader2, FileText } from 'lucide-react';

interface Practice {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  display_order: number;
  created_at: string;
  difficulty_level: string | null;
  duration_minutes: number | null;
  instructions: string | null;
  benefits: string[];
  prerequisites: string[];
  tradition_source: string | null;
  video_url: string | null;
  audio_url: string | null;
}

interface BulkRow {
  name: string;
  slug: string;
  description: string;
  category: string;
  display_order: string;
  _status?: 'pending' | 'success' | 'error';
  _error?: string;
}

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const emptyForm = (): Partial<Practice> => ({
  name: '', slug: '', description: '', category: '', display_order: 0,
  difficulty_level: '', duration_minutes: null, instructions: '', benefits: [],
  prerequisites: [], tradition_source: '', video_url: '', audio_url: '',
});

const CSV_HEADERS = ['name', 'slug', 'description', 'category', 'display_order'];

const CSV_TEMPLATE = `name,slug,description,category,display_order
Dhikr,dhikr,"Remembrance of God through repetition of holy names",Contemplative,1
Fikr,fikr,"Deep reflection on spiritual matters",Contemplative,2
Muraqaba,muraqaba,"Silent meditation and mindfulness",Contemplative,3`;

export default function PracticesAdminPage() {
  const [items, setItems] = useState<Practice[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<Practice | null>(null);
  const [form, setForm] = useState<Partial<Practice>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);

  const load = useCallback(async (pageNum: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pageNum), pageSize: String(PAGE_SIZE) });
    if (search.trim()) params.set('search', search.trim());
    const res = await fetch(`/api/admin/cms/practices?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(0); }, []);

  function openCreate() { setEditing(null); setForm(emptyForm()); setModalOpen(true); }
  function openEdit(item: Practice) { setEditing(item); setForm({ ...item }); setModalOpen(true); }

  async function handleSave() {
    setSaving(true);
    const slug = form.slug?.trim() || generateSlug(form.name ?? '');
    const payload = {
      name: form.name, slug,
      description: form.description || null,
      category: form.category || null,
      display_order: form.display_order ?? 0,
      difficulty_level: form.difficulty_level || null,
      duration_minutes: form.duration_minutes ?? null,
      instructions: form.instructions || null,
      benefits: form.benefits || [],
      prerequisites: form.prerequisites || [],
      tradition_source: form.tradition_source || null,
      video_url: form.video_url || null,
      audio_url: form.audio_url || null,
    };
    await fetch('/api/admin/cms/practices', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
    });
    setModalOpen(false);
    await load(page);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this practice? This cannot be undone.')) return;
    setDeleting(id);
    await fetch('/api/admin/cms/practices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load(page);
    setDeleting(null);
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'practices_bulk_template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function parseCSV(text: string): BulkRow[] {
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    return lines.slice(1).map((line) => {
      const cols: string[] = [];
      let cur = ''; let inQuote = false;
      for (const ch of line) {
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ''; }
        else { cur += ch; }
      }
      cols.push(cur.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = (cols[i] ?? '').replace(/^"|"$/g, '').trim(); });
      return {
        name: row.name || '', slug: row.slug || generateSlug(row.name),
        description: row.description || '', category: row.category || '',
        display_order: row.display_order || '0',
        _status: 'pending',
      } as BulkRow;
    }).filter((r) => r.name);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setBulkRows(parseCSV(text)); setBulkDone(false);
    };
    reader.readAsText(file);
  }

  async function handleBulkUpload() {
    setBulkUploading(true);
    const updated = [...bulkRows];
    for (let i = 0; i < updated.length; i++) {
      const row = updated[i];
      if (row._status === 'success') continue;
      try {
        const payload = {
          name: row.name, slug: row.slug || generateSlug(row.name),
          description: row.description || null, category: row.category || null,
          display_order: row.display_order ? Number(row.display_order) : 0,
        };
        const res = await fetch('/api/admin/cms/practices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, upsert: true }),
        });
        updated[i] = { ...row, _status: res.ok ? 'success' : 'error', _error: res.ok ? undefined : `HTTP ${res.status}` };
      } catch (err: unknown) {
        updated[i] = { ...row, _status: 'error', _error: err instanceof Error ? err.message : 'Unknown error' };
      }
      setBulkRows([...updated]);
    }
    setBulkUploading(false); setBulkDone(true); await load(page);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] flex items-center gap-2">
            <Sparkles size={20} className="text-[#C8A75E]" />
            Spiritual Practices
          </h1>
          <p className="text-[#AAB0D6] text-sm mt-1">Manage spiritual practices and contemplations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors p-2">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => { setBulkRows([]); setBulkDone(false); setBulkOpen(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-[#AAB0D6] rounded-lg text-sm hover:bg-white/8 hover:text-[#F5F3EE] transition-colors"
          >
            <Upload size={14} />
            Bulk Upload
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8A75E] text-[#080A18] rounded-lg text-sm font-medium hover:bg-[#D4B86A] transition-colors"
          >
            <Plus size={15} />
            Add Practice
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAB0D6]" />
        <input
          value={search}
          onChange={e => { const newSearch = e.target.value; setSearch(newSearch); setPage(0); load(0); }}
          placeholder="Search by name..."
          className="w-full bg-[#0B0F2A] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F5F3EE] placeholder-[#AAB0D6]/50 focus:outline-none focus:border-[#C8A75E]/50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-[#C8A75E] animate-spin" />
        </div>
      ) : (
        <div className="bg-[#0B0F2A] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#AAB0D6] uppercase tracking-wider hidden lg:table-cell">Order</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#AAB0D6] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-[#AAB0D6]">No practices found</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-[#F5F3EE] font-medium">{item.name}</div>
                    {item.description && <div className="text-[#AAB0D6] text-xs mt-0.5 line-clamp-1">{item.description}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#AAB0D6]">
                    {item.category && <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-[#AAB0D6]">{item.category}</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[#AAB0D6] text-xs">{item.display_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-[#AAB0D6] hover:text-[#C8A75E] hover:bg-white/5 rounded-lg transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="p-1.5 text-[#AAB0D6] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">
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
              <button onClick={() => { const newPage = Math.max(0, page - 1); setPage(newPage); load(newPage); }} disabled={page === 0} className="px-3 py-1 text-xs text-[#AAB0D6] bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10">Previous</button>
              <button onClick={() => { const newPage = page + 1; setPage(newPage); load(newPage); }} disabled={items.length < PAGE_SIZE} className="px-3 py-1 text-xs text-[#AAB0D6] bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10">Next</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0B0F2A] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-sm font-semibold text-[#F5F3EE]">{editing ? 'Edit Practice' : 'Add Practice'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#AAB0D6] hover:text-[#F5F3EE]"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Name *</label>
                  <input
                    value={form.name ?? ''}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Slug</label>
                  <input
                    value={form.slug ?? ''}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Category</label>
                  <input
                    value={form.category ?? ''}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="e.g., Contemplative, Devotional"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order ?? 0}
                    onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Difficulty Level</label>
                  <select
                    value={form.difficulty_level ?? ''}
                    onChange={e => setForm(f => ({ ...f, difficulty_level: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Duration (minutes)</label>
                  <input
                    type="number"
                    value={form.duration_minutes ?? ''}
                    onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="e.g., 30"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Tradition Source</label>
                  <input
                    value={form.tradition_source ?? ''}
                    onChange={e => setForm(f => ({ ...f, tradition_source: e.target.value }))}
                    placeholder="e.g., Chisti, Qadiri"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Video URL</label>
                  <input
                    value={form.video_url ?? ''}
                    onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Audio URL</label>
                  <input
                    value={form.audio_url ?? ''}
                    onChange={e => setForm(f => ({ ...f, audio_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Description</label>
                  <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] resize-none focus:outline-none focus:border-[#C8A75E]/50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Instructions</label>
                  <textarea value={form.instructions ?? ''} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} rows={4} placeholder="Step-by-step instructions" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] resize-none focus:outline-none focus:border-[#C8A75E]/50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Benefits (comma-separated)</label>
                  <input
                    value={form.benefits?.join(', ') ?? ''}
                    onChange={e => setForm(f => ({ ...f, benefits: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    placeholder="e.g., inner peace, spiritual growth"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#AAB0D6] mb-1.5">Prerequisites (comma-separated)</label>
                  <input
                    value={form.prerequisites?.join(', ') ?? ''}
                    onChange={e => setForm(f => ({ ...f, prerequisites: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    placeholder="e.g., completion of beginner course"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F5F3EE] focus:outline-none focus:border-[#C8A75E]/50"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="flex items-center gap-2 px-4 py-2 bg-[#C8A75E] text-[#080A18] rounded-lg text-sm font-medium hover:bg-[#D4B86A] transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0B0F2A] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-sm font-semibold text-[#F5F3EE]">Bulk Upload Practices</h2>
                <p className="text-xs text-[#AAB0D6]/50 mt-0.5">Upload a CSV file to add multiple practices at once</p>
              </div>
              <button onClick={() => setBulkOpen(false)} className="text-[#AAB0D6] hover:text-[#F5F3EE]"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#C8A75E]/5 border border-[#C8A75E]/15">
                <FileText className="w-5 h-5 text-[#C8A75E] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#F5F3EE] mb-0.5">CSV Format</p>
                  <p className="text-[10px] text-[#AAB0D6]/60">Required columns: {CSV_HEADERS.join(', ')}</p>
                </div>
                <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8A75E]/10 border border-[#C8A75E]/25 text-[#C8A75E] text-xs font-medium hover:bg-[#C8A75E]/18 transition-colors flex-shrink-0">
                  <Download size={12} />
                  Template
                </button>
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-white/10 rounded-xl text-center hover:border-[#C8A75E]/30 hover:bg-[#C8A75E]/3 transition-all group">
                  <Upload className="w-6 h-6 text-[#AAB0D6]/30 group-hover:text-[#C8A75E]/50 mx-auto mb-2 transition-colors" />
                  <p className="text-sm text-[#AAB0D6]/50 group-hover:text-[#AAB0D6] transition-colors">
                    {bulkRows.length > 0 ? `${bulkRows.length} records loaded — click to replace` : 'Click to select CSV file'}
                  </p>
                </button>
              </div>
              {bulkRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#AAB0D6]/50">{bulkRows.length} records ready</p>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={10} />{bulkRows.filter(r => r._status === 'success').length} success</span>
                      <span className="flex items-center gap-1 text-rose-400"><AlertCircle size={10} />{bulkRows.filter(r => r._status === 'error').length} error</span>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded-xl border border-white/8">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-[#0A0C18]">
                        <tr className="border-b border-white/8">
                          <th className="px-3 py-2 text-left text-[#AAB0D6]/50 font-medium">Name</th>
                          <th className="px-3 py-2 text-left text-[#AAB0D6]/50 font-medium hidden sm:table-cell">Category</th>
                          <th className="px-3 py-2 text-left text-[#AAB0D6]/50 font-medium hidden md:table-cell">Order</th>
                          <th className="px-3 py-2 text-right text-[#AAB0D6]/50 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/4">
                        {bulkRows.map((row, i) => (
                          <tr key={i} className={row._status === 'success' ? 'bg-emerald-500/5' : row._status === 'error' ? 'bg-rose-500/5' : ''}>
                            <td className="px-3 py-2 text-[#F5F3EE]">{row.name}</td>
                            <td className="px-3 py-2 text-[#AAB0D6]/50 hidden sm:table-cell">{row.category}</td>
                            <td className="px-3 py-2 text-[#AAB0D6]/50 hidden md:table-cell">{row.display_order}</td>
                            <td className="px-3 py-2 text-right">
                              {row._status === 'success' && <CheckCircle2 size={12} className="text-emerald-400 inline" />}
                              {row._status === 'error' && <span className="text-rose-400" title={row._error}>Error</span>}
                              {row._status === 'pending' && <span className="text-[#AAB0D6]/30">Pending</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {bulkDone && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-sm">
                  <CheckCircle2 size={14} />
                  Upload complete. {bulkRows.filter(r => r._status === 'success').length} practices added/updated.
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setBulkOpen(false)} className="px-4 py-2 text-sm text-[#AAB0D6] hover:text-[#F5F3EE] transition-colors">{bulkDone ? 'Close' : 'Cancel'}</button>
              {!bulkDone && (
                <button onClick={handleBulkUpload} disabled={bulkRows.length === 0 || bulkUploading} className="flex items-center gap-2 px-4 py-2 bg-[#C8A75E] text-[#080A18] rounded-lg text-sm font-medium hover:bg-[#D4B86A] transition-colors disabled:opacity-50">
                  {bulkUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {bulkUploading ? 'Uploading...' : `Upload ${bulkRows.length} Practices`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}