'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Clock, SquareCheck as CheckSquare, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const stats = [
    {
      title: 'Total Employees',
      value: 24,
      change: '+2 this month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Avg. Work Hours',
      value: '8.5h',
      change: '+0.5h from last month',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Tasks Completed',
      value: 156,
      change: '+23 this week',
      icon: CheckSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Productivity',
      value: '92%',
      change: '+5% from last month',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const departmentStats = [
    { department: 'Engineering', employees: 12, productivity: '95%', tasks: 89 },
    { department: 'Design', employees: 5, productivity: '92%', tasks: 34 },
    { department: 'Marketing', employees: 4, productivity: '88%', tasks: 21 },
    { department: 'Sales', employees: 3, productivity: '90%', tasks: 12 },
  ];

  const topPerformers = [
    { name: 'Shubham Raj', role: 'Full Stack Developer', tasksCompleted: 45, hours: 176 },
    { name: 'John Doe', role: 'UI/UX Designer', tasksCompleted: 38, hours: 168 },
    { name: 'Sarah Smith', role: 'Project Manager', tasksCompleted: 32, hours: 172 },
    { name: 'Mike Johnson', role: 'Frontend Developer', tasksCompleted: 29, hours: 164 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View comprehensive reports and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Productivity</TableHead>
                <TableHead>Tasks Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentStats.map((dept) => (
                <TableRow key={dept.department}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell>{dept.employees}</TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {dept.productivity}
                    </span>
                  </TableCell>
                  <TableCell>{dept.tasks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tasks Completed</TableHead>
                <TableHead>Hours Worked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformers.map((performer) => (
                <TableRow key={performer.name}>
                  <TableCell className="font-medium">{performer.name}</TableCell>
                  <TableCell>{performer.role}</TableCell>
                  <TableCell>{performer.tasksCompleted}</TableCell>
                  <TableCell>{performer.hours}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
