'use client';

import { useState, useEffect } from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { user, employee, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Clear any local state if needed
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="flex h-16 items-center justify-between border-b bg-white px-8">
        <div>
          <div className="text-2xl font-semibold text-primary">
            Loading...
          </div>
          <div className="text-xs text-muted-foreground">
            Loading...
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <div>
        <div className="text-2xl font-semibold text-primary">
          {formatTime(currentTime)}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(currentTime)}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {employee?.name ? getInitials(employee.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium">{employee?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground">
                  {employee?.is_admin ? 'Admin' : employee?.role || 'Employee'}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
