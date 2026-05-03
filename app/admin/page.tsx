'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Heart, FileText, UserCheck, Route, BookOpen, Building2, ScrollText, Star, TrendingUp, Clock, CircleAlert as AlertCircle, ArrowRight, MessageSquare, Shield, CircleCheck as CheckCircle, ChartBar as BarChart3, Activity, Mail } from 'lucide-react';

interface ModuleMetric {
  label: string;
  value: number;
  pending: number;
  approved: number;
  declined: number;
  href: string;
  color: string;
}

interface RecentActivity {
  type: string;
  name: string;
  status: string;
  time: string;
  typeColor: string;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  'Membership': <UserCheck size={18} />,
  'Volunteer': <Users size={18} />,
  'Pathway': <Route size={18} />,
  'Mentorship': <BookOpen size={18} />,
  'Collaboration': <Building2 size={18} />,
  'Conference': <ScrollText size={18} />,
  'Contact': <Mail size={18} />,
};

const CMS_LINKS = [
  { label: 'Saints Database',  desc: 'Sufi masters & lineages',       href: '/admin/cms/saints',    icon: <Star size={15} />,          color: '#C8A75E' },
  { label: 'Research Papers',  desc: 'Publications & research',        href: '/admin/cms/research',  icon: <FileText size={15} />,      color: '#6B9BD1' },
  { label: 'Dialogues',        desc: 'Series, episodes & transcripts', href: '/admin/cms/dialogues', icon: <MessageSquare size={15} />, color: '#7BC47F' },
  { label: 'Users',            desc: 'Portal members & admins',        href: '/admin/users',         icon: <Shield size={15} />,        color: '#E8856A' },
];

function statusDot(s: string) {
  if (s === 'pending' || s === 'submitted') return 'bg-amber-400';
  if (s === 'approved' || s === 'accepted') return 'bg-emerald-400';
  if (s === 'declined' || s === 'rejected') return 'bg-red-400';
  if (s === 'under_review') return 'bg-blue-400';
  return 'bg-white/20';
}

function statusLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function AdminDashboard() {
  const [modules, setModules] = useState<ModuleMetric[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          console.error('Dashboard API failed:', res.status);
          return { modules: [], totalDonations: 0, donationCount: 0, totalUsers: 0, recentActivity: [], userRole: '' };
        }
        return res.json();
      })
      .then(data => {
        if (data.userRole) setUserRole(data.userRole);
        if (data.modules) setModules(data.modules);
        if (data.totalDonations !== undefined) setTotalDonations(data.totalDonations);
        if (data.donationCount !== undefined) setDonationCount(data.donationCount);
        if (data.totalUsers !== undefined) setTotalUsers(data.totalUsers);
        if (data.recentActivity) setRecentActivity(data.recentActivity);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      const roleRedirects: Record<string, string> = {
        application_handler: '/admin/membership',
        finance_handler: '/admin/donations',
        cms_handler: '/admin/cms/saints',
      };
      if (roleRedirects[userRole]) {
        router.replace(roleRedirects[userRole]);
      }
    }
  }, [userRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#C8A75E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userRole && userRole !== 'admin') {
    return null;
  }

  const totalPending = modules.reduce((s, m) => s + m.pending, 0);
  const totalApplications = modules.reduce((s, m) => s + m.value, 0);
  const totalApproved = modules.reduce((s, m) => s + m.approved, 0);
  const maxModule = Math.max(...modules.map(m => m.value), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#C8A75E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F3EE] tracking-tight">Admin Dashboard</h1>
          <p className="text-[#6B7099] text-sm mt-0.5">Sufi Science Center — operational overview</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs text-[#6B7099]">Today</div>
          <div className="text-sm text-[#AAB0D6] font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={<AlertCircle size={16} />}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-400"
          label="Pending Review"
          value={totalPending.toString()}
          sub="requires action"
          highlight={totalPending > 0}
        />
        <KpiCard
          icon={<BarChart3 size={16} />}
          iconBg="bg-[#C8A75E]/10"
          iconColor="text-[#C8A75E]"
          label="Total Submissions"
          value={totalApplications.toString()}
          sub="all modules"
        />
        <KpiCard
          icon={<CheckCircle size={16} />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
          label="Approved"
          value={totalApproved.toString()}
          sub={`${totalApplications > 0 ? Math.round((totalApproved / totalApplications) * 100) : 0}% approval rate`}
        />
        <KpiCard
          icon={<Heart size={16} />}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-400"
          label="Total Donations"
          value={`$${totalDonations.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          sub={`${donationCount} contributions`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0B0F2A] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#C8A75E]" />
              <span className="text-sm font-medium text-[#F5F3EE]">Application Modules</span>
            </div>
            <span className="text-xs text-[#6B7099]">{modules.length} modules</span>
          </div>

          <div className="divide-y divide-white/5">
            {modules.map((mod) => (
              <Link
                key={mod.label}
                href={mod.href}
                className="group flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                >
                  {MODULE_ICONS[mod.label]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#E8E6E0] group-hover:text-white transition-colors">{mod.label}</span>
                    <div className="flex items-center gap-3 text-xs text-[#6B7099] shrink-0 ml-4">
                      {mod.pending > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Clock size={10} />
                          {mod.pending} pending
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle size={10} />
                        {mod.approved}
                      </span>
                      <span className="font-semibold text-[#AAB0D6]">{mod.value} total</span>
                    </div>
                  </div>
                  <MiniBar value={mod.value} max={maxModule} color={mod.color} />
                </div>

                <ArrowRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0B0F2A] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
              <Users size={15} className="text-[#C8A75E]" />
              <span className="text-sm font-medium text-[#F5F3EE]">Portal Members</span>
            </div>
            <div className="px-5 py-5 flex items-center gap-4">
              <div className="text-4xl font-bold text-[#F5F3EE] tracking-tight">{totalUsers}</div>
              <div className="text-xs text-[#6B7099] leading-relaxed">registered<br />portal users</div>
            </div>
          </div>

          <div className="bg-[#0B0F2A] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
              <TrendingUp size={15} className="text-[#C8A75E]" />
              <span className="text-sm font-medium text-[#F5F3EE]">CMS</span>
            </div>
            <div className="p-3 space-y-1">
              {CMS_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}18`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-[#E8E6E0] group-hover:text-white transition-colors leading-tight">{item.label}</div>
                    <div className="text-xs text-[#6B7099] truncate">{item.desc}</div>
                  </div>
                  <ArrowRight size={12} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0B0F2A] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-[#C8A75E]" />
            <span className="text-sm font-medium text-[#F5F3EE]">Recent Submissions</span>
          </div>
          <span className="text-xs text-[#6B7099]">latest {recentActivity.length}</span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#6B7099] text-sm">No recent activity</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 last:border-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot(item.status)}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-[#E8E6E0] truncate">{item.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium" style={{ color: item.typeColor }}>{item.type}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-xs text-[#6B7099]">{statusLabel(item.status)}</span>
                  </div>
                </div>
                <span className="text-xs text-[#4A5068] shrink-0">{timeAgo(item.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon, iconBg, iconColor, label, value, sub, highlight,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-[#0B0F2A] border rounded-2xl p-4 ${highlight ? 'border-amber-500/30' : 'border-white/8'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-[#F5F3EE] tracking-tight">{value}</div>
      <div className="text-xs text-[#AAB0D6] mt-0.5 font-medium">{label}</div>
      <div className="text-xs text-[#6B7099] mt-0.5">{sub}</div>
    </div>
  );
}
