'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, SquareCheck as CheckSquare, FileText, Clock, Calendar, ChartBar as BarChart3, User, Settings, Building2, Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/providers/sidebar-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();
  const { employee } = useAuth();

  // Initialize the browser client for logout
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isAdmin = employee?.email === 'pixelnodeofficial@gmail.com' || employee?.role === 'Admin';

  const navigation = isAdmin ? [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/products', icon: Package },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Daily Reports', href: '/daily-reports', icon: FileText },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Leaves', href: '/leaves', icon: Calendar },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Account Settings', href: '/account', icon: Settings },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Daily Reports', href: '/daily-reports', icon: FileText },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Leaves', href: '/leaves', icon: Calendar },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear session cookies manually to ensure the middleware catches the change
      document.cookie = "sb-access-token=; Path=/; Max-Age=0;";
      document.cookie = "sb-refresh-token=; Path=/; Max-Age=0;";
      
      toast.success('Logged out successfully');
      
      // Use window.location to force a fresh state and avoid middleware cache
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggle} className="bg-white">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r bg-white text-slate-900 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Building2 className="h-8 w-8 text-[#7C3AED]" />
          <div>
            <h1 className="text-lg font-semibold">PixelNode</h1>
            <p className="text-xs text-muted-foreground">Tech Agency</p>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-sm font-medium">
              {employee?.name ? employee.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {employee?.name || 'User'}
              </div>
              <div className="text-xs text-muted-foreground truncate uppercase font-bold text-[#7C3AED]">
                {isAdmin ? 'Head of Development' : employee?.role || 'Employee'}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100",
                pathname === item.href ? "bg-slate-100 text-[#7C3AED] font-semibold" : "text-slate-600"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={toggle} />
      )}
    </>
  );
}