import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#080A18] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-serif font-semibold text-[#F5F3EE] mb-2">Access Denied</h1>
        <p className="text-sm text-[#AAB0D6]/50 mb-6">
          Your account does not have administrator privileges.
        </p>
        <Link
          href="/admin/login"
          className="text-xs text-[#C8A75E] hover:text-[#C8A75E]/80 transition-colors"
        >
          Return to login
        </Link>
      </div>
    </div>
  );
}
