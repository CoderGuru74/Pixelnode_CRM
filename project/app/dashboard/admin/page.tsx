'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  Loader2,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { employee } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Fetch Active Projects Count (Using correct 'status' column)
      const { count: pCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // 2. Fetch Total Employees
      const { count: eCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      // 3. Fetch Recent Projects for the list
      const { data: latest } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        activeProjects: pCount || 0,
        totalEmployees: eCount || 0,
        presentToday: 0, // Attendance logic can be added later
        pendingLeaves: 0
      });
      setRecentProjects(latest || []);
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#7C3AED]" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 font-medium">
            Founder of PixelNode: <span className="text-[#7C3AED] font-bold">{employee?.name || 'Shubham Raj'}</span>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Projects', val: stats.activeProjects, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Team Members', val: stats.totalEmployees, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Present Today', val: `${stats.presentToday} / ${stats.totalEmployees}`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Requests', val: stats.pendingLeaves, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</CardTitle>
              <div className={`${item.bg} p-2.5 rounded-xl`}><item.icon className={`h-4 w-4 ${item.color}`} /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{item.val}</div>
              <div className="mt-2 flex items-center text-[10px] font-bold text-slate-400 uppercase leading-none">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> Database Live
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
            <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Recent Agency Activity</h2>
            <div className="space-y-6">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0 group">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition-all">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-800">{project.name}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Client: {project.client_name || 'Individual'} • Status: <span className="capitalize text-[#7C3AED] font-bold">{project.status}</span></p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">
                  No Recent Projects Found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#7C3AED] p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-black text-xl mb-2 tracking-tight">Agency Overview</h3>
              <p className="text-purple-100 text-xs mb-6 font-medium">Currently managing {stats.activeProjects} active operations.</p>
              <button className="w-full bg-white text-[#7C3AED] hover:bg-purple-50 rounded-2xl font-black text-[10px] h-12 uppercase tracking-widest transition-all">
                Team Reports
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}