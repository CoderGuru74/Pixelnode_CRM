'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, SquareCheck as CheckSquare, Clock, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';

interface Stats {
  totalEmployees: number;
  activeTasks: number;
  attendanceToday: number;
  pendingLeaves: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  clockedIn: boolean;
  clockInTime?: string;
  dailyReportSubmitted: boolean;
}

export default function DashboardPage() {
  const { employee, loading, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeTasks: 0,
    attendanceToday: 0,
    pendingLeaves: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // THE FIX: Check if you are the owner even if the DB hasn't returned an employee record yet
  const isAdmin = useMemo(() => {
    return employee?.is_admin || user?.email === 'pixelnodeofficial@gmail.com';
  }, [employee, user]);

  const fetchStats = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const [employees, tasks, attendance, leaves] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).neq('status', 'Completed'),
        supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'Present'),
        supabase.from('leaves').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
      ]);

      setStats({
        totalEmployees: employees.count || 0,
        activeTasks: tasks.count || 0,
        attendanceToday: attendance.count || 0,
        pendingLeaves: leaves.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        setActivities([
          { id: '1', type: 'task', description: 'PixelNode System: Active & Secured', time: 'Just now' },
          { id: '2', type: 'auth', description: 'Admin session verified', time: '1 minute ago' },
        ]);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      setActivities([]);
    }
  }, []);

  const fetchTeamMonitor = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data: employees } = await supabase.from('employees').select('*').eq('is_admin', false);
      const { data: attendance } = await supabase.from('attendance').select('*').eq('date', today);
      const { data: reports } = await supabase.from('daily_reports').select('*').eq('date', today);

      const teamData: TeamMember[] = employees?.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        clockedIn: attendance?.some(att => att.user_id === emp.user_id && att.check_in && !att.check_out) || false,
        dailyReportSubmitted: reports?.some(rep => rep.user_id === emp.user_id) || false,
      })) || [];

      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error in monitor:', error);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    
    if (user && !loading) {
      fetchStats();
      fetchActivities();
      if (isAdmin) fetchTeamMonitor();
    }
  }, [user, loading, isAdmin, fetchStats, fetchActivities, fetchTeamMonitor, router]);

  // Updated Loading Logic to prevent infinite spin for Admin
  if (loading || (user && !employee && user.email !== 'pixelnodeofficial@gmail.com')) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-slate-500 font-medium">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Active Tasks', value: stats.activeTasks, icon: CheckSquare, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Attendance Today', value: `${stats.attendanceToday}/${stats.totalEmployees}`, icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Pending Leaves', value: stats.pendingLeaves, icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isAdmin ? 'Admin Control Center' : 'Employee Dashboard'}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Welcome back, <span className="text-[#7C3AED]">{employee?.name || 'Admin'}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">PixelNode v1.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin ? (
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-700">
              <Eye className="h-5 w-5 text-[#7C3AED]" />
              Live Team Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {teamMembers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-2xl border-slate-100">
                   <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                   <p className="text-slate-400 font-medium">No active employees found in database.</p>
                </div>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{member.name}</div>
                      <div className="text-xs text-slate-500 font-medium">{member.department}</div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${member.clockedIn ? 'bg-green-500 ring-4 ring-green-50' : 'bg-slate-200'}`}></div>
                        <span className="text-[10px] mt-2 font-bold text-slate-400 uppercase tracking-tighter">{member.clockedIn ? 'Online' : 'Offline'}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${member.dailyReportSubmitted ? 'bg-blue-500 ring-4 ring-blue-50' : 'bg-slate-200'}`}></div>
                        <span className="text-[10px] mt-2 font-bold text-slate-400 uppercase tracking-tighter">Report</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold text-slate-700">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] font-bold py-6 shadow-lg shadow-purple-100 transition-all active:scale-95" onClick={() => router.push('/attendance')}>Clock In / Out</Button>
              <Button variant="outline" className="w-full font-bold py-6" onClick={() => router.push('/daily-reports')}>Submit Daily Report</Button>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold text-slate-700">Task Management</CardTitle></CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full h-[132px] text-lg font-bold text-slate-600 flex flex-col gap-2" onClick={() => router.push('/tasks')}>
                <CheckSquare className="h-8 w-8 text-[#7C3AED]" />
                View Assignments
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold text-slate-700">Recent System Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="h-2.5 w-2.5 mt-1.5 rounded-full bg-[#7C3AED] ring-4 ring-purple-50" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">{activity.description}</p>
                  <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-bold">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}