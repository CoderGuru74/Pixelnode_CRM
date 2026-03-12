'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, SquareCheck as CheckSquare, Clock, Calendar, Eye, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';

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
  const { employee } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeTasks: 0,
    attendanceToday: 0,
    pendingLeaves: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const isAdmin = employee?.is_admin || false;

  useEffect(() => {
    fetchStats();
    fetchActivities();
    if (isAdmin) {
      fetchTeamMonitor();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const [employees, tasks, attendance, leaves] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact', head: true }),
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .neq('status', 'Completed'),
        supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('date', today)
          .eq('status', 'Present'),
        supabase
          .from('leaves')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'Pending'),
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
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching activities:', error);
        // Fallback to mock data if table doesn't exist yet
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'task',
            description: 'New task assigned: Update landing page',
            time: '5 minutes ago',
          },
          {
            id: '2',
            type: 'attendance',
            description: 'John Doe clocked in',
            time: '15 minutes ago',
          },
          {
            id: '3',
            type: 'leave',
            description: 'Sarah Smith requested leave',
            time: '1 hour ago',
          },
          {
            id: '4',
            type: 'report',
            description: 'Daily report submitted by Mike Johnson',
            time: '2 hours ago',
          },
        ];
        setActivities(mockActivities);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching activities:', error);
      setActivities([]);
    }
  };

  const fetchTeamMonitor = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      // Fetch all employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('is_admin', false);

      if (empError) {
        console.error('Error fetching employees:', empError);
        return;
      }

      // Fetch today's attendance
      const { data: attendance, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      if (attError) {
        console.error('Error fetching attendance:', attError);
      }

      // Fetch today's daily reports
      const { data: reports, error: repError } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('date', today);

      if (repError) {
        console.error('Error fetching daily reports:', repError);
      }

      // Combine data
      const teamData: TeamMember[] = employees?.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        clockedIn: attendance?.some(att => att.user_id === emp.user_id && att.check_in !== null && att.check_out === null) || false,
        clockInTime: attendance?.find(att => att.user_id === emp.user_id && att.check_in !== null)?.check_in,
        dailyReportSubmitted: reports?.some(rep => rep.user_id === emp.user_id) || false,
      })) || [];

      setTeamMembers(teamData);
    } catch (error) {
      console.error('Unexpected error fetching team monitor:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Tasks',
      value: stats.activeTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Attendance Today',
      value: `${stats.attendanceToday}/${stats.totalEmployees}`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (!employee) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">
          {isAdmin ? 'Admin Dashboard' : 'Employee Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'Monitor your team and manage operations' : 'Manage your daily activities and tasks'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee View - Quick Actions */}
      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/attendance">
                <Button className="w-full">
                  Clock In / Clock Out
                </Button>
              </Link>
              <Link href="/daily-reports">
                <Button variant="outline" className="w-full">
                  Submit Daily Report
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/tasks">
                <Button variant="outline" className="w-full">
                  View My Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin View - Live Team Status */}
      {isAdmin && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Team Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No team members found
                </p>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.department}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full ${member.clockedIn ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="text-xs mt-1">
                          {member.clockedIn ? 'Clocked In' : 'Not Clocked In'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full ${member.dailyReportSubmitted ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className="text-xs mt-1">
                          {member.dailyReportSubmitted ? 'Report' : 'No Report'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity - Show for both roles */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No recent activities
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
