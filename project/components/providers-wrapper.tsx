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
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fail-safe: If loading takes more than 3 seconds, force show the UI
    // This prevents the infinite spinner if a profile fetch hangs.
    const timer = setTimeout(() => {
      if (loading) setTimedOut(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Prevent Hydration Mismatch
  if (!mounted) return null;

  const isAuthPage = pathname === '/signin' || pathname === '/login' || pathname === '/';

  // 1. Auth Pages (Login/Signin)
  if (isAuthPage) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  // 2. Loading State (With Fail-safe)
  // If we are still loading AND we haven't timed out yet, show the spinner
  if (loading && !timedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-400 animate-pulse">Syncing PixelNode...</p>
      </div>
    );
  }

  // 3. Main Dashboard Layout
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}