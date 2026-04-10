'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Users } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[users page] Fetching users...');
    fetch('/api/admin/users', { credentials: 'include' })
      .then(res => {
        console.log('[users page] Response status:', res.status);
        if (!res.ok) {
          console.error('[users page] Users API returned error:', res.status);
          return { users: [] };
        }
        return res.json();
      })
      .then(data => {
        console.log('[users page] Users data received:', data);
        console.log('[users page] Users count:', data.users?.length || 0);
        // Main app returns { users, total, page, pageSize }
        setUsers(data.users || []);
      })
      .catch(err => {
        console.error('[users page] Error fetching users:', err);
        setUsers([]);
      })
      .finally(() => {
        console.log('[users page] Loading complete');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#080A18] p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-[#AAB0D6] hover:text-[#C8A75E] mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-[#C8A75E]" size={24} />
          <h1 className="text-2xl font-serif font-semibold text-[#F5F3EE]">Portal Users</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#C8A75E]" /></div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center bg-[#0B0F2A] border border-white/8 rounded-2xl">
            <p className="text-[#6B7099]">No users found</p>
          </div>
        ) : (
          <div className="bg-[#0B0F2A] border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8">
                <tr className="text-left text-[#6B7099] text-xs uppercase tracking-wider">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.slice(0, 20).map((user: any) => (
                  <tr key={user.id} className="text-[#E8E6E0]">
                    <td className="px-5 py-3">{user.displayName || user.name || 'N/A'}</td>
                    <td className="px-5 py-3 text-[#AAB0D6]">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-[#C8A75E]/10 text-[#C8A75E]">
                        portal user
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
