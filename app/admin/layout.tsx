'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Heart,
  FileText,
  UserCheck,
  Route,
  BookOpen,
  Building2,
  Star,
  ScrollText,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Shield,
  LifeBuoy,
  CalendarDays,
  GitBranch,
  Lightbulb,
  Globe,
  Clock,
  TrendingUp,
  Sparkles,
  Compass,
  AlertTriangle,
  Mic,
  Mail,
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: 'Applications',
    icon: <FileText size={16} />,
    children: [
      { label: 'Membership', href: '/admin/membership', icon: <UserCheck size={16} /> },
      { label: 'Volunteer', href: '/admin/volunteer', icon: <Users size={16} /> },
      { label: 'Pathway', href: '/admin/pathway', icon: <Route size={16} /> },
      { label: 'Mentorship', href: '/admin/mentorship', icon: <BookOpen size={16} /> },
      { label: 'Collaboration', href: '/admin/collaboration', icon: <Building2 size={16} /> },
      { label: 'Conference', href: '/admin/conference', icon: <ScrollText size={16} /> },
      { label: 'Insight Interviews', href: '/admin/insight-interviews', icon: <Mic size={16} /> },
      { label: 'Conference Events', href: '/admin/conference-event', icon: <CalendarDays size={16} /> },
      { label: 'Contributions', href: '/admin/contributions', icon: <FileText size={16} /> },
    ],
  },
  {
    label: 'Financial',
    icon: <Heart size={16} />,
    children: [
      { label: 'Donations', href: '/admin/donations', icon: <Heart size={16} /> },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: <TrendingUp size={16} /> },
    ],
  },
  {
    label: 'CMS',
    icon: <Star size={16} />,
    children: [
      { label: 'Foundations', href: '/admin/cms/lineages', icon: <GitBranch size={16} /> },
      { label: 'Themes', href: '/admin/cms/themes', icon: <Lightbulb size={16} /> },
      { label: 'Regions', href: '/admin/cms/regions', icon: <Globe size={16} /> },
      { label: 'Historical Periods', href: '/admin/cms/periods', icon: <Clock size={16} /> },
      { label: 'Saints', href: '/admin/cms/saints', icon: <Star size={16} /> },
      { label: 'Research Papers', href: '/admin/cms/research', icon: <FileText size={16} /> },
      { label: 'Dialogues', href: '/admin/cms/dialogues', icon: <MessageSquare size={16} /> },
      { label: 'Inner Development', href: '/admin/cms/stages', icon: <TrendingUp size={16} />, children: [
        { label: 'Stages', href: '/admin/cms/stages', icon: <TrendingUp size={16} /> },
        { label: 'Practices', href: '/admin/cms/practices', icon: <Sparkles size={16} /> },
        { label: 'Emotional Intelligence', href: '/admin/cms/emotional', icon: <Heart size={16} /> },
        { label: 'Pathways', href: '/admin/cms/guidance', icon: <Compass size={16} /> },
        { label: 'Study Circles', href: '/admin/cms/circles', icon: <Users size={16} /> },
        { label: 'Mentorship', href: '/admin/cms/mentorship', icon: <BookOpen size={16} /> },
      ]},
      { label: 'Inner Dialogues', href: '/admin/cms/hard-inquiry', icon: <AlertTriangle size={16} />, children: [
        { label: 'Hard Inquiry', href: '/admin/cms/hard-inquiry', icon: <AlertTriangle size={16} /> },
        { label: 'Interviews', href: '/admin/cms/insight-interviews', icon: <Mic size={16} /> },
        { label: 'Applied Practices', href: '/admin/cms/applied-practices', icon: <Lightbulb size={16} /> },
      ]},
    ],
  },
  {
    label: 'Reflections',
    href: '/admin/reflections',
    icon: <ScrollText size={16} />,
  },
  {
    label: 'Contact Submissions',
    href: '/admin/contact-submissions',
    icon: <Mail size={16} />,
  },
  {
    label: 'Support Tickets',
    href: '/admin/support',
    icon: <LifeBuoy size={16} />,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: <Shield size={16} />,
  },
];

const APPLICATION_PAGE_KEYS: Record<string, string> = {
  '/admin/membership': 'membership',
  '/admin/volunteer': 'volunteer',
  '/admin/pathway': 'pathway',
  '/admin/mentorship': 'mentorship',
  '/admin/collaboration': 'collaboration',
  '/admin/conference': 'conference',
  '/admin/insight-interviews': 'insight-interviews',
  '/admin/conference-event': 'conference-event',
  '/admin/contributions': 'contributions',
};

function getFilteredNavItems(role: string, permissions: string[]): NavItem[] {
  if (role === 'admin') return ALL_NAV_ITEMS;

  const filtered: NavItem[] = [];

  filtered.push(ALL_NAV_ITEMS[0]);

  if (role === 'application_handler') {
    const appSection = ALL_NAV_ITEMS.find(item => item.label === 'Applications');
    if (appSection?.children) {
      const allowedChildren = appSection.children.filter(child => {
        if (!child.href) return true;
        const key = APPLICATION_PAGE_KEYS[child.href];
        if (!key) return false;
        const mappedKey = key === 'pathway' ? 'pathway' :
                         key === 'insight-interviews' ? 'insight-interviews' :
                         key;
        return permissions.includes(mappedKey);
      });
      if (allowedChildren.length > 0) {
        filtered.push({ ...appSection, children: allowedChildren });
      }
    }
  }

  if (role === 'finance_handler') {
    const financeSection = ALL_NAV_ITEMS.find(item => item.label === 'Financial');
    if (financeSection) filtered.push(financeSection);
  }

  if (role === 'cms_handler') {
    const cmsSection = ALL_NAV_ITEMS.find(item => item.label === 'CMS');
    if (cmsSection) filtered.push(cmsSection);
  }

  return filtered;
}

function hasAccessToPath(pathname: string, role: string, permissions: string[]): boolean {
  if (role === 'admin') return true;
  if (pathname === '/admin' || pathname === '/admin/') return true;

  if (role === 'application_handler') {
    const key = APPLICATION_PAGE_KEYS[pathname];
    if (key) return permissions.includes(key);
    return false;
  }

  if (role === 'finance_handler') {
    return pathname.startsWith('/admin/donations') || pathname.startsWith('/admin/subscriptions');
  }

  if (role === 'cms_handler') {
    return pathname.startsWith('/admin/cms');
  }

  return false;
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some(c => c.href === pathname || c.children?.some(cc => cc.href === pathname));
  });

  const isActive = item.href === pathname;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            open ? 'text-[#C8A75E] bg-white/5' : 'text-[#AAB0D6] hover:text-[#F5F3EE] hover:bg-white/5'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <span className="opacity-70">{item.icon}</span>
            {item.label}
          </span>
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        {open && (
          <div className="mt-1 ml-3 pl-3 border-l border-white/10 space-y-0.5">
            {item.children.map(child => (
              <NavItemComponent key={child.href || child.label} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive
          ? 'text-[#C8A75E] bg-[#C8A75E]/10 font-medium'
          : 'text-[#AAB0D6] hover:text-[#F5F3EE] hover:bg-white/5'
      }`}
    >
      <span className={isActive ? 'text-[#C8A75E]' : 'opacity-70'}>{item.icon}</span>
      {item.label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (pathname === '/admin/login' || pathname === '/admin/unauthorized') {
      setChecking(false);
      setIsAuthenticated(true);
      return;
    }

    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            setIsAuthenticated(true);
            if (data.userRole) setUserRole(data.userRole);
            if (data.userPermissions) setUserPermissions(data.userPermissions);
          });
        } else {
          console.log('[layout] Dashboard API returned:', res.status);
          router.push('/admin/login?redirect=' + encodeURIComponent(pathname));
        }
      })
      .catch((err) => {
        console.error('[layout] Dashboard API error:', err);
        router.push('/admin/login?redirect=' + encodeURIComponent(pathname));
      })
      .finally(() => setChecking(false));
  }, [router, pathname]);

  useEffect(() => {
    if (userRole && !hasAccessToPath(pathname, userRole, userPermissions)) {
      if (pathname !== '/admin/unauthorized') {
        router.push('/admin/unauthorized');
      }
    }
  }, [pathname, userRole, userPermissions, router]);

  if (pathname === '/admin/login' || pathname === '/admin/unauthorized') {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#080A18] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C8A75E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/session', { method: 'DELETE' });
      router.push('/admin/login');
    } catch {
      setLoggingOut(false);
    }
  }

  const navItems = getFilteredNavItems(userRole, userPermissions);

  return (
    <div className="min-h-screen bg-[#080A18] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-[#0B0F2A] border-r border-white/10 z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 group" title="Back to website">
            <img src="/SSC_LOGO_UPDATED.png" alt="SSC Logo" className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="text-[#C8A75E] font-semibold text-xs tracking-wide leading-tight group-hover:text-[#D9BB78] transition-colors">SSC Admin</div>
              <div className="text-[#AAB0D6] text-[10px] mt-0.5 group-hover:text-[#C8C8D6] transition-colors">Visit website</div>
            </div>
          </Link>
          <button
            className="lg:hidden text-[#AAB0D6] hover:text-[#F5F3EE]"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(item => (
            <NavItemComponent key={item.href || item.label} item={item} />
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#AAB0D6] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <LogOut size={16} />
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-[#080A18]/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#AAB0D6] hover:text-[#F5F3EE]"
          >
            <Menu size={20} />
          </button>
          <span className="text-[#C8A75E] font-semibold text-sm">SSC Admin</span>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
