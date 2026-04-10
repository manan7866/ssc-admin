'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="min-h-screen bg-[#080A18] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#C8A75E]/10 border border-[#C8A75E]/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#C8A75E]" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-serif font-semibold text-[#F5F3EE]">Admin Access</h1>
          <p className="text-xs text-[#AAB0D6]/40 mt-1">Sufi Science Center — Restricted</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form
          action="/api/admin/login-form"
          method="POST"
          className="space-y-4"
        >
          <input type="hidden" name="redirect" value={redirect} />
          {error && <input type="hidden" name="error" value={error} />}
          <div>
            <label className="block text-xs text-[#AAB0D6]/60 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-[#0D1020] text-[#F5F3EE] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C8A75E]/50 transition-colors"
              placeholder="admin@email.org"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs text-[#AAB0D6]/60 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                className="w-full bg-[#0D1020] text-[#F5F3EE] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#C8A75E]/50 transition-colors"
                placeholder="••••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAB0D6]/40 hover:text-[#AAB0D6]/80 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#C8A75E] text-[#0B0F2A] font-semibold rounded-xl py-3 text-sm hover:bg-[#C8A75E]/90 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Sign In
          </button>
        </form>

        <p className="text-center text-[10px] text-[#AAB0D6]/20 mt-8">
          Access restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080A18] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8A75E]" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
