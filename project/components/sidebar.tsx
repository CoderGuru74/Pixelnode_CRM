'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  SquareCheck as CheckSquare, 
  FileText, 
  Clock, 
  Calendar, 
  ChartBar as BarChart3, 
  Settings, 
  Building2, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/providers/sidebar-provider';
import { useAuth } from '@/components/providers/auth-provider';

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();
  const { employee, isAdmin, signOut } = useAuth();

  // Define Navigation based on Admin status
  // We updated these paths to match your new folder structure:
  // /dashboard/admin/projects and /dashboard/admin/tasks
  const navigation = isAdmin ? [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/admin/projects', icon: Package },
    { name: 'Tasks', href: '/dashboard/admin/tasks', icon: CheckSquare },
    { name: 'Daily Reports', href: '/dashboard/admin/daily-reports', icon: FileText },
    { name: 'Attendance', href: '/dashboard/admin/attendance', icon: Clock },
    { name: 'Leaves', href: '/dashboard/admin/leaves', icon: Calendar },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: 'Account Settings', href: '/dashboard/admin/account', icon: Settings },
  ] : [
    { name: 'Dashboard', href: '/dashboard/employee', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/dashboard/employee/tasks', icon: CheckSquare },
    { name: 'Daily Reports', href: '/dashboard/employee/daily-reports', icon: FileText },
    { name: 'Attendance', href: '/dashboard/employee/attendance', icon: Clock },
    { name: 'Leaves', href: '/dashboard/employee/leaves', icon: Calendar },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggle} className="bg-white shadow-sm border-slate-200">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r bg-white text-slate-900 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Building2 className="h-8 w-8 text-[#7C3AED]" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">PixelNode</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Tech Agency</p>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-sm font-bold shadow-inner">
              {employee?.name ? employee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate text-slate-800">
                {employee?.name || 'User'}
              </div>
              <div className="text-[10px] text-[#7C3AED] truncate uppercase font-extrabold tracking-tighter">
                {isAdmin ? 'Head of Development' : employee?.role || 'Team Member'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                  isActive 
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] font-bold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-[#7C3AED]" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={toggle} />
      )}
    </>
  );
}