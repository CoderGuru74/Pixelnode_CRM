'use client';

import { SidebarProvider } from './sidebar-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
