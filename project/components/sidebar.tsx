'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, SquareCheck as CheckSquare, FileText, Clock, Calendar, ChartBar as BarChart3, User, Settings, Building2, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/providers/sidebar-provider';
import { useAuth } from '@/components/providers/auth-provider';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/products', icon: Package },
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
  const { isOpen, toggle } = useSidebar();
  const { employee } = useAuth();

  const isAdmin = employee?.email === 'pixelnodeofficial@gmail.com';

  const navigation = isAdmin ? [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Account', href: '/account', icon: Settings },
    { name: 'Projects', href: '/products', icon: Package },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Daily Reports', href: '/daily-reports', icon: FileText },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Leaves', href: '/leaves', icon: Calendar },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Daily Reports', href: '/daily-reports', icon: FileText },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Leaves', href: '/leaves', icon: Calendar },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          className="bg-white"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <Building2 className="h-8 w-8" />
          <div>
            <h1 className="text-lg font-semibold">PixelNode</h1>
            <p className="text-xs text-muted-foreground">Tech Agency</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {employee?.name ? employee.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {employee?.name || 'User'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {employee?.email === 'pixelnodeofficial@gmail.com' ? 'Head of Development' : employee?.role || 'Employee'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation - Only for Admin */}
        {isAdmin && (
          <div className="border-t border-white/10 p-4 space-y-1">
            {bottomNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={toggle}
        />
      )}
    </>
  );
}
