'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Users, Search, Save } from 'lucide-react';

const ROLES = [
  { value: 'portal_user', label: 'Portal User' },
  { value: 'admin', label: 'Admin' },
  { value: 'application_handler', label: 'Application Handler' },
  { value: 'finance_handler', label: 'Finance Handler' },
  { value: 'cms_handler', label: 'CMS Handler' },
];

const ROLE_COLORS: Record<string, string> = {
  portal_user: '#6B7099',
  admin: '#C8A75E',
  application_handler: '#6B9BD1',
  finance_handler: '#7BC47F',
  cms_handler: '#E8856A',
};

const ROLE_LABELS: Record<string, string> = {
  portal_user: 'Portal User',
  admin: 'Admin',
  application_handler: 'Application Handler',
  finance_handler: 'Finance Handler',
  cms_handler: 'CMS Handler',
};

const APPLICATION_PERMISSIONS = [
  { value: 'membership', label: 'Membership' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'conference', label: 'Conference' },
  { value: 'conference-event', label: 'Conference Event' },
  { value: 'contributions', label: 'Contributions' },
];

interface AdminUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [editingRoles, setEditingRoles] = useState<Record<string, string>>({});
  const [editingPermissions, setEditingPermissions] = useState<Record<string, string[]>>({});

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    
    fetch(`/api/admin/users?${params.toString()}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : { users: [] })
      .then(data => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (userId: string, role: string) => {
    setEditingRoles(prev => ({ ...prev, [userId]: role }));
    if (role !== 'application_handler') {
      setEditingPermissions(prev => ({ ...prev, [userId]: [] }));
    } else {
      const user = users.find(u => u.id === userId);
      setEditingPermissions(prev => ({ ...prev, [userId]: user?.permissions || [] }));
    }
  };

  const handlePermissionToggle = (userId: string, permission: string) => {
    setEditingPermissions(prev => {
      const current = prev[userId] || [];
      const updated = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission];
      return { ...prev, [userId]: updated };
    });
  };

  const handleSave = async (user: AdminUser) => {
    const newRole = editingRoles[user.id] || user.role;
    const newPermissions = editingPermissions[user.id] || [];

    if (newRole === 'application_handler' && newPermissions.length === 0) {
      alert('Application Handler must have at least one permission selected');
      return;
    }

    setSavingUserId(user.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          role: newRole,
          permissions: newRole === 'application_handler' ? newPermissions : [],
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to update user');
        return;
      }

      fetchUsers();
    } catch {
      alert('Error updating user');
    } finally {
      setSavingUserId(null);
    }
  };

  const hasChanges = (user: AdminUser) => {
    const newRole = editingRoles[user.id] || user.role;
    const newPermissions = editingPermissions[user.id] || user.permissions;
    return newRole !== user.role || JSON.stringify(newPermissions) !== JSON.stringify(user.permissions);
  };

  return (
    <div className="min-h-screen bg-[#080A18] p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/admin" className="inline-flex items-center gap-2 text-[#AAB0D6] hover:text-[#C8A75E] mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </a>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-[#C8A75E]" size={24} />
            <h1 className="text-2xl font-serif font-semibold text-[#F5F3EE]">Admin Users</h1>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7099]" size={18} />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="w-full bg-[#0B0F2A] border border-white/8 rounded-xl pl-10 pr-4 py-3 text-[#F5F3EE] placeholder:text-[#6B7099] focus:outline-none focus:border-[#C8A75E]/50"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#C8A75E]" /></div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center bg-[#0B0F2A] border border-white/8 rounded-2xl">
            <p className="text-[#6B7099]">No users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const currentRole = editingRoles[user.id] || user.role;
              const currentPermissions = editingPermissions[user.id] ?? user.permissions;
              const isEditing = hasChanges(user);
              const isSaving = savingUserId === user.id;

              return (
                <div key={user.id} className="bg-[#0B0F2A] border border-white/8 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[#F5F3EE] font-medium">{user.email}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${ROLE_COLORS[user.role] || '#6B7099'}20`,
                            color: ROLE_COLORS[user.role] || '#6B7099',
                          }}
                        >
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </div>
                      <div className="text-[#6B7099] text-xs">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs text-[#6B7099] mr-1">Set Role:</div>
                      <select
                        value={currentRole}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-[#080A18] border border-white/10 rounded-lg px-3 py-2 text-[#F5F3EE] text-sm focus:outline-none focus:border-[#C8A75E]/50"
                      >
                        {ROLES.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>

                      {isEditing && (
                        <button
                          onClick={() => handleSave(user)}
                          disabled={isSaving}
                          className="flex items-center gap-2 bg-[#C8A75E] hover:bg-[#D9BB78] text-[#080A18] px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          <Save size={14} />
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      )}
                    </div>
                  </div>

                  {currentRole === 'application_handler' && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="text-[#AAB0D6] text-sm mb-3">Page Access Permissions:</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {APPLICATION_PERMISSIONS.map(perm => (
                          <label
                            key={perm.value}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={currentPermissions.includes(perm.value)}
                              onChange={() => handlePermissionToggle(user.id, perm.value)}
                              className="w-4 h-4 rounded border-white/20 bg-[#080A18] text-[#C8A75E] focus:ring-[#C8A75E] focus:ring-offset-0"
                            />
                            <span className="text-[#F5F3EE] text-sm">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
