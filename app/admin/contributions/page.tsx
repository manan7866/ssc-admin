'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CircleCheck as CheckCircle2, Clock, Eye, CircleAlert as AlertCircle, RotateCcw, FileText, Search, ChevronDown, ChevronUp, ExternalLink, Loader as Loader2, X, Users, Filter, ArrowLeft, Calendar, Mail, MapPin, User } from 'lucide-react';

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  research_paper: 'Research Paper',
  dialogue_proposal: 'Dialogue Proposal',
  interview_proposal: 'Interview Proposal',
  sacred_media: 'Sacred Media',
  practice_submission: 'Practice & Ritual',
  sacred_text: 'Sacred Text & Poetry',
  article_essay: 'Thematic Article',
  conference_workshop: 'Conference / Workshop',
};

const WORKFLOW_STAGES: Record<string, { value: string; label: string; color: string; dot: string }[]> = {
  research_paper: [
    { value: 'submitted', label: 'Submitted', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
    { value: 'editorial_screening', label: 'Editorial Screening', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
    { value: 'peer_review', label: 'Peer Review', color: 'text-purple-400', dot: 'bg-purple-400' },
    { value: 'revision_requested', label: 'Revision Requested', color: 'text-orange-400', dot: 'bg-orange-400' },
    { value: 'accepted', label: 'Accepted', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-400', dot: 'bg-red-400' },
    { value: 'published', label: 'Published', color: 'text-[#27AE60]', dot: 'bg-[#27AE60]' },
  ],
  dialogue_proposal: [
    { value: 'submitted', label: 'Submitted', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
    { value: 'theme_review', label: 'Theme Review', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
    { value: 'speaker_review', label: 'Speaker Review', color: 'text-purple-400', dot: 'bg-purple-400' },
    { value: 'approved', label: 'Approved', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    { value: 'scheduled', label: 'Scheduled', color: 'text-blue-400', dot: 'bg-blue-400' },
    { value: 'published_event', label: 'Published Event', color: 'text-[#27AE60]', dot: 'bg-[#27AE60]' },
  ],
  interview_proposal: [
    { value: 'submitted', label: 'Submitted', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
    { value: 'editorial_review', label: 'Editorial Review', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
    { value: 'contact_nominee', label: 'Contact Nominee', color: 'text-purple-400', dot: 'bg-purple-400' },
    { value: 'approved', label: 'Approved', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    { value: 'scheduled', label: 'Scheduled', color: 'text-blue-400', dot: 'bg-blue-400' },
    { value: 'published', label: 'Published', color: 'text-[#27AE60]', dot: 'bg-[#27AE60]' },
  ],
  sacred_media: [
    { value: 'submitted', label: 'Submitted', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
    { value: 'rights_check', label: 'Rights Check', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
    { value: 'cultural_review', label: 'Cultural Review', color: 'text-purple-400', dot: 'bg-purple-400' },
    { value: 'media_review', label: 'Media Review', color: 'text-orange-400', dot: 'bg-orange-400' },
    { value: 'accepted', label: 'Accepted', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    { value: 'published', label: 'Published to Media/Archive', color: 'text-[#27AE60]', dot: 'bg-[#27AE60]' },
  ],
  practice_submission: [
    { value: 'submitted', label: 'Submitted', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
    { value: 'authenticity_review', label: 'Authenticity Review', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
    { value: 'safety_review', label: 'Safety Review', color: 'text-orange-400', dot: 'bg-orange-400' },
    { value: 'editorial_review', label: 'Editorial Review', color: 'text-purple-400', dot: 'bg-purple-400' },
    { value: 'approved', label: 'Approved', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    { value: 'restricted', label: 'Restricted', color: 'text-yellow-400', dot: 'bg-yellow-400' },
    { value: 'declined', label: 'Declined', color: 'text-red-400', dot: 'bg-red-400' },
  ],
  sacred_text: [
    { value: 'submitted', label: 'Submitted', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
    { value: 'literary_review', label: 'Literary Review', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
    { value: 'source_rights_review', label: 'Source/Rights Review', color: 'text-purple-400', dot: 'bg-purple-400' },
    { value: 'editorial_review', label: 'Editorial Review', color: 'text-orange-400', dot: 'bg-orange-400' },
    { value: 'accepted', label: 'Accepted', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    { value: 'published', label: 'Published', color: 'text-[#27AE60]', dot: 'bg-[#27AE60]' },
  ],
  article_essay: [
    { value: 'submitted', label: 'Submitted', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
    { value: 'editorial_screening', label: 'Editorial Screening', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
    { value: 'revision_requested', label: 'Revision Requested', color: 'text-orange-400', dot: 'bg-orange-400' },
    { value: 'accepted', label: 'Accepted', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    { value: 'declined', label: 'Declined', color: 'text-red-400', dot: 'bg-red-400' },
    { value: 'published', label: 'Published', color: 'text-[#27AE60]', dot: 'bg-[#27AE60]' },
  ],
  conference_workshop: [
    { value: 'submitted', label: 'Submitted', color: 'text-[#6B9BD1]', dot: 'bg-[#6B9BD1]' },
    { value: 'program_review', label: 'Program Review', color: 'text-[#C8A75E]', dot: 'bg-[#C8A75E]' },
    { value: 'logistics_review', label: 'Logistics Review', color: 'text-purple-400', dot: 'bg-purple-400' },
    { value: 'approved', label: 'Approved', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    { value: 'scheduled', label: 'Scheduled', color: 'text-blue-400', dot: 'bg-blue-400' },
    { value: 'registration_open', label: 'Registration Open', color: 'text-[#27AE60]', dot: 'bg-[#27AE60]' },
  ],
};

function getWorkflowStages(type: string) {
  return WORKFLOW_STAGES[type] || WORKFLOW_STAGES.research_paper;
}

function getStatusConfig(type: string, status: string) {
  const stages = getWorkflowStages(type);
  return stages.find(s => s.value === status) || stages[0];
}

function StatusDot({ type, status }: { type: string; status: string }) {
  const cfg = getStatusConfig(type, status);
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

interface Submission {
  id: string;
  submissionType: string;
  title: string;
  abstract: string;
  content: string;
  submissionData: Record<string, any> | null;
  contactName: string;
  contactEmail: string;
  contactAffiliation: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
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
  const stages = getWorkflowStages(submission.submissionType);
  const [status, setStatus] = useState(submission.status);
  const [notes, setNotes] = useState(submission.adminNotes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const data = submission.submissionData || {};

  async function handleSave() {
    setSaving(true);
    await onUpdate(submission.id, { status, adminNotes: notes });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const typeLabel = SUBMISSION_TYPE_LABELS[submission.submissionType] || submission.submissionType;

  const fieldGroups: { label: string; value?: string }[] = [];

  const addField = (key: string, label: string) => {
    const val = data[key];
    if (val && typeof val === 'string' && val.trim()) {
      fieldGroups.push({ label, value: val });
    } else if (typeof val === 'boolean') {
      fieldGroups.push({ label, value: val ? 'Yes' : 'No' });
    }
  };

  if (submission.submissionType === 'research_paper') {
    addField('affiliation', 'Affiliation');
    addField('discipline', 'Discipline');
    addField('keywords', 'Keywords');
    addField('citationStyle', 'Citation Style');
    addField('coAuthors', 'Co-Authors');
    addField('orcidLink', 'ORCID');
    addField('suggestedModule', 'Suggested Module');
    addField('fileUrl', 'File URL');
  } else if (submission.submissionType === 'dialogue_proposal') {
    addField('dialogueTitle', 'Dialogue Title');
    addField('mainQuestion', 'Main Question');
    addField('proposedSpeakers', 'Proposed Speakers');
    addField('format', 'Format');
    addField('targetAudience', 'Target Audience');
    addField('whyItMatters', 'Why It Matters');
    addField('preferredDateTime', 'Preferred Date/Time');
    addField('supportingNotes', 'Supporting Notes');
  } else if (submission.submissionType === 'interview_proposal') {
    addField('nomineeName', 'Nominee');
    addField('nomineeBio', 'Nominee Bio');
    addField('fieldOfWork', 'Field of Work');
    addField('whyInterview', 'Why Interview');
    addField('suggestedQuestions', 'Suggested Questions');
    addField('linksToWork', 'Links to Work');
  } else if (submission.submissionType === 'sacred_media') {
    addField('mediaTitle', 'Media Title');
    addField('mediaType', 'Media Type');
    addField('language', 'Language');
    addField('traditionContext', 'Tradition/Context');
    addField('lyricsText', 'Lyrics/Text');
    addField('fileUrl', 'File URL');
    addField('culturalContext', 'Cultural Context');
    addField('credits', 'Credits');
  } else if (submission.submissionType === 'practice_submission') {
    addField('practiceName', 'Practice Name');
    addField('traditionSource', 'Tradition/Source');
    addField('lineageContext', 'Lineage');
    addField('stepDescription', 'Steps');
    addField('safetyConsiderations', 'Safety');
    addField('whoShouldPractice', 'Who Should Practice');
    addField('durationFrequency', 'Duration/Frequency');
    addField('requiredPreparation', 'Preparation');
    addField('culturalSensitivity', 'Cultural Sensitivity');
  } else if (submission.submissionType === 'sacred_text') {
    addField('title', 'Title');
    addField('contentType', 'Content Type');
    addField('language', 'Language');
    addField('originalSource', 'Original Source');
    addField('translationRights', 'Translation Rights');
    addField('textBody', 'Text Body');
    addField('commentaryContext', 'Commentary');
    addField('authorAttribution', 'Author Attribution');
  } else if (submission.submissionType === 'article_essay') {
    addField('articleTitle', 'Article Title');
    addField('themeCategory', 'Theme/Category');
    addField('abstractSummary', 'Abstract');
    addField('fullText', 'Full Text');
    addField('references', 'References');
    addField('keywords', 'Keywords');
    addField('intendedAudience', 'Intended Audience');
  } else if (submission.submissionType === 'conference_workshop') {
    addField('programTitle', 'Program Title');
    addField('programType', 'Program Type');
    addField('description', 'Description');
    addField('objectives', 'Objectives');
    addField('speakersFacilitators', 'Speakers');
    addField('duration', 'Duration');
    addField('preferredDates', 'Preferred Dates');
    addField('format', 'Format');
    addField('audience', 'Audience');
    addField('expectedParticipants', 'Expected Participants');
    addField('requirementsResources', 'Requirements');
    addField('budgetSponsorship', 'Budget/Sponsorship');
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0A0C18] border-l border-white/8 z-50 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div>
          <p className="text-xs text-[#AAB0D6]/40 uppercase tracking-widest mb-0.5">Review Panel</p>
          <p className="text-sm text-[#C8A75E] font-bold">{typeLabel}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#AAB0D6]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div>
          <h3 className="font-serif font-semibold text-[#F5F3EE] leading-snug mb-1">{submission.title}</h3>
          <p className="text-xs text-[#AAB0D6]/50">{submission.contactName}</p>
          <p className="text-[10px] text-[#AAB0D6]/30 mt-1">{submission.contactEmail}</p>
          {submission.contactAffiliation && <p className="text-[10px] text-[#AAB0D6]/30">{submission.contactAffiliation}</p>}
        </div>

        <div className="p-4 rounded-xl bg-white/2 border border-white/5">
          <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-2">Abstract</p>
          <p className="text-xs text-[#AAB0D6] leading-relaxed">{submission.abstract}</p>
        </div>

        {fieldGroups.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest">Submission Details</p>
            {fieldGroups.map((fg, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/2 border border-white/5">
                <p className="text-[10px] text-[#AAB0D6]/30 uppercase tracking-wider mb-1">{fg.label}</p>
                <p className="text-xs text-[#AAB0D6] leading-relaxed whitespace-pre-wrap">{fg.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-white/5 pt-5 space-y-4">
          <p className="text-xs font-semibold text-[#F5F3EE] uppercase tracking-widest">Editorial Decision</p>

          <div>
            <label className="block text-xs text-[#AAB0D6] mb-1.5">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export default function AdminContributionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);

    const res = await fetch(`/api/admin/submissions?${params.toString()}`, { credentials: 'include' });
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setLoading(false);
  }, [typeFilter, statusFilter, search]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  async function handleUpdate(id: string, updates: Partial<Submission>) {
    await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, status: updates.status, adminNotes: updates.adminNotes }),
    });
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, ...updates } : null);
  }

  const filtered = submissions;

  const counts = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    inReview: submissions.filter(s => s.status !== 'submitted' && s.status !== 'published' && s.status !== 'published_event' && s.status !== 'registration_open' && s.status !== 'accepted' && s.status !== 'approved' && s.status !== 'rejected' && s.status !== 'declined' && s.status !== 'restricted').length,
    completed: submissions.filter(s => ['published', 'published_event', 'registration_open', 'accepted', 'approved'].includes(s.status)).length,
  };

  return (
    <div className="min-h-screen bg-[#08091A] text-[#F5F3EE]">
      <div className="border-b border-white/5 bg-[#0A0C18]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-[#AAB0D6]/40 hover:text-[#C8A75E] transition-colors text-xs mb-1">
              <ArrowLeft className="w-3 h-3" />
              Dashboard
            </Link>
            <h1 className="text-xl font-serif font-bold text-[#F5F3EE]">Contributions Review</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchSubmissions} className="text-[#AAB0D6] hover:text-[#C8A75E] text-xs">Refresh</Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: counts.total, icon: Users, color: '#AAB0D6' },
            { label: 'New', value: counts.submitted, icon: Clock, color: '#6B9BD1' },
            { label: 'In Review', value: counts.inReview, icon: Eye, color: '#C8A75E' },
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
            <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchSubmissions()} className="bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm focus:border-[#C8A75E]" placeholder="Search by title, name, or email..." />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
              <Filter className="w-3.5 h-3.5 mr-2 text-[#AAB0D6]/40" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(SUBMISSION_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-[#0D1020] border-white/10 text-[#F5F3EE] text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {typeFilter !== 'all' ? (
                getWorkflowStages(typeFilter).map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)
              ) : (
                <>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="editorial_screening">Editorial Screening</SelectItem>
                  <SelectItem value="peer_review">Peer Review</SelectItem>
                  <SelectItem value="revision_requested">Revision Requested</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#C8A75E] animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#AAB0D6]/30 text-sm">No submissions found.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((sub) => {
              const isExpanded = expanded === sub.id;
              const data = sub.submissionData || {};
              return (
                <div key={sub.id} className="glass-panel border border-white/5 hover:border-white/10 rounded-xl transition-all overflow-hidden">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-8 h-8 rounded-lg bg-white/3 flex items-center justify-center flex-shrink-0">
                      <FileText className={`w-4 h-4 ${getStatusConfig(sub.submissionType, sub.status).color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C8A75E]/8 border border-[#C8A75E]/15 text-[#C8A75E]">{SUBMISSION_TYPE_LABELS[sub.submissionType] || sub.submissionType}</span>
                        <StatusDot type={sub.submissionType} status={sub.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#F5F3EE] truncate">{sub.title}</p>
                      <p className="text-xs text-[#AAB0D6]/50">{sub.contactName} · {sub.contactEmail}</p>
                    </div>
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <p className="text-[10px] text-[#AAB0D6]/25">{formatDate(sub.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" onClick={() => setSelected(sub)} className="bg-[#C8A75E]/10 text-[#C8A75E] hover:bg-[#C8A75E]/20 border border-[#C8A75E]/20 text-xs px-3 h-7">Review</Button>
                      <button onClick={() => setExpanded(isExpanded ? null : sub.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#AAB0D6]/40">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { icon: User, label: 'Name', value: sub.contactName },
                          { icon: Mail, label: 'Email', value: sub.contactEmail },
                          { icon: MapPin, label: 'Affiliation', value: sub.contactAffiliation || '—' },
                          { icon: Calendar, label: 'Submitted', value: formatDate(sub.createdAt) },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label}>
                            <p className="text-[10px] tracking-[0.15em] text-[#AAB0D6]/30 uppercase mb-1 flex items-center gap-1.5"><Icon className="w-3 h-3" /> {label}</p>
                            <p className="text-sm text-[#F5F7FA]">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p className="text-[10px] tracking-[0.15em] text-[#AAB0D6]/30 uppercase mb-2">Abstract</p>
                        <p className="text-xs text-[#AAB0D6]/65 leading-relaxed">{sub.abstract}</p>
                      </div>

                      {Object.keys(data).filter(k => !['originalityDeclaration', 'ethicsDeclaration', 'rightsOwnership', 'permissionToPublish', 'consentConfirmation'].includes(k)).length > 0 && (
                        <div>
                          <p className="text-[10px] tracking-[0.15em] text-[#AAB0D6]/30 uppercase mb-2">Submission Data</p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {Object.entries(data).map(([k, v]) => {
                              if (typeof v === 'boolean') return null;
                              if (!v || (typeof v === 'string' && !v.trim())) return null;
                              return (
                                <div key={k} className="p-2 rounded bg-white/2 border border-white/5">
                                  <p className="text-[10px] text-[#AAB0D6]/30 uppercase">{k}</p>
                                  <p className="text-xs text-[#F5F7FA] truncate">{String(v)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

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
          <ReviewPanel submission={selected} onUpdate={handleUpdate} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  );
}
