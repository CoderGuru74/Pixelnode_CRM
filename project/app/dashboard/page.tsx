'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, SquareCheck as CheckSquare, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeTasks: 0,
    attendanceToday: 0,
    pendingLeaves: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchStats();
    fetchActivities();
  }, []);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

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
  };

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setActivities(data);
    } else {
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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, here's what's happening today
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

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
