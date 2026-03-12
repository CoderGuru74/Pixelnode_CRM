'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, SquareCheck as CheckSquare, FileText, Clock, Calendar, ChartBar as BarChart3, User, Settings, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Daily Reports', href: '/daily-reports', icon: FileText },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Leaves', href: '/leaves', icon: Calendar },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'My Profile', href: '/profile', icon: User },
  { name: 'Account', href: '/account', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <Building2 className="h-8 w-8" />
        <div>
          <h1 className="text-xl font-bold">PixelNode</h1>
          <p className="text-xs opacity-75">Tech Agency</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[hsl(var(--sidebar-accent))] text-white'
                  : 'text-white/80 hover:bg-[hsl(var(--sidebar-accent))] hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[hsl(var(--sidebar-accent))] text-white'
                  : 'text-white/80 hover:bg-[hsl(var(--sidebar-accent))] hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
