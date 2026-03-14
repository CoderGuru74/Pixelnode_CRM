'use client';

import { useState, useEffect } from 'react';
import { Bell, User, LogOut, Shield, Fingerprint, Mail, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/providers/auth-provider';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, employee, signOut, isAdmin } = useAuth();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';
  };

  // Prevent hydration mismatch
  if (!mounted) return <header className="h-16 border-b bg-white px-8" />;

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
        <div>
          <div className="text-2xl font-bold text-[#7C3AED] tabular-nums">
            {formatTime(currentTime)}
          </div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
            {formatDate(currentTime)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-[#7C3AED]">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-slate-50 transition-all">
                <Avatar className="h-9 w-9 border-2 border-[#7C3AED]/10">
                  <AvatarFallback className="bg-[#7C3AED] text-white text-xs font-bold">
                    {employee?.name ? getInitials(employee.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-bold text-slate-900 leading-tight">{employee?.name || 'User'}</div>
                  <div className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-tighter">
                    {isAdmin ? 'Agency Admin' : employee?.role || 'Team Member'}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64 p-2">
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">{employee?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{employee?.email || user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfile(true)} className="cursor-pointer">
                <User className="mr-2 h-4 w-4 text-slate-400" />
                <span>My Profile Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Building className="mr-2 h-4 w-4 text-slate-400" />
                <span>Agency Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* PROFILE DETAILS MODAL */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#7C3AED]" />
              Account Verification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div className="h-12 w-12 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-lg">
                  {employee?.name ? getInitials(employee.name) : 'U'}
               </div>
               <div>
                  <h3 className="font-bold text-slate-900">{employee?.name}</h3>
                  <p className="text-xs text-[#7C3AED] font-bold uppercase">{employee?.role || 'Employee'}</p>
               </div>
            </div>

            <div className="space-y-3 px-1">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 font-medium">{employee?.email || user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Fingerprint className="h-4 w-4 text-slate-400" />
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase font-bold text-slate-400">Unique User ID</span>
                   <code className="text-xs bg-slate-100 p-1 rounded text-[#7C3AED]">{user?.id}</code>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 font-medium">{employee?.department || 'General'}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
             <Button onClick={() => setShowProfile(false)} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                Close Details
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}