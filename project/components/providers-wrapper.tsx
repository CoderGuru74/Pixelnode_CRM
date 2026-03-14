'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isAuthPage = pathname === '/signin' || pathname === '/login' || pathname === '/';

  // 1. If we are on an auth page, just show the login/signin form without Sidebar/Header
  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  // 2. If loading auth, show a clean full-screen spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 3. Render the Dashboard layout
  return (
    <div className="flex h-screen overflow-hidden bg-secondary/30">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {user ? children : null}
        </main>
      </div>
    </div>
  );
}