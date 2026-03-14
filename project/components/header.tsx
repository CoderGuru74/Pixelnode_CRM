'use client';

import { useState, useEffect } from 'react';
import { Bell, User, LogOut, Shield, Fingerprint, Mail, Building, ChevronDown, Loader2 } from 'lucide-react';
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
  const { user, employee, signOut, isAdmin, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';
  };

  if (!mounted) return <header className="h-16 border-b bg-white/80 backdrop-blur-md px-8" />;

  // SYNCING DATA FROM DATABASE
  const userName = employee?.name || user?.email?.split('@')[0] || "User";
  const userRole = isAdmin ? 'Head of Agency' : (employee?.role || 'Team Member');
  const userDept = employee?.department || 'General';

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white px-8 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatTime(currentTime)}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              {formatDate(currentTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 mr-4 px-3 py-1 bg-green-50 rounded-full border border-green-100">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 uppercase">Live Sync</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-1 py-1 h-11 hover:bg-slate-50 rounded-xl transition-all border border-slate-100">
                <Avatar className="h-8 w-8 ring-2 ring-[#7C3AED]/10">
                  <AvatarFallback className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white text-[10px] font-black">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : userName}
                  </p>
                  <p className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider">
                    {userRole}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 ml-1 mr-2" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-2xl border-slate-100">
              <DropdownMenuLabel className="p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#7C3AED] font-bold">
                    {getInitials(userName)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">{userName}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{employee?.email || user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="my-2 bg-slate-50" />
              
              <div className="p-1 space-y-1">
                <DropdownMenuItem onClick={() => setShowProfile(true)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">My Profile</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">ID & Verification</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-default transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Building className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Department</span>
                    <span className="text-[9px] text-[#7C3AED] uppercase font-black">{userDept}</span>
                  </div>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-2 bg-slate-50" />
              
              <DropdownMenuItem onClick={signOut} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold">Terminate Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* DETAILED PROFILE MODAL */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-[#7C3AED] h-24 w-full relative">
            <div className="absolute -bottom-10 left-8">
               <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-slate-100 text-[#7C3AED] font-black text-xl">
                    {getInitials(userName)}
                  </AvatarFallback>
               </Avatar>
            </div>
          </div>
          
          <div className="pt-14 pb-8 px-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">{userName}</h3>
              <p className="text-sm font-bold text-[#7C3AED] flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {userRole}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Work Email</span>
                  <span className="text-sm font-bold text-slate-700">{employee?.email || user?.email}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Building className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                  <span className="text-sm font-bold text-slate-700">{userDept}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Fingerprint className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Employee ID</span>
                  <code className="text-[11px] font-mono text-[#7C3AED] mt-1 bg-white px-2 py-1 rounded border border-[#7C3AED]/10 truncate">
                    {user?.id}
                  </code>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowProfile(false)} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-lg shadow-slate-200">
               Back to Workspace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}