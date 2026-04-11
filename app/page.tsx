'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin login page
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080A18] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C8A75E] mx-auto mb-4" />
        <p className="text-[#AAB0D6] text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
}
