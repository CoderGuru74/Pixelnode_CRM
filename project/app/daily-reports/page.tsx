'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DailyReport {
  id: string;
  date: string;
  content: string;
  tasks_completed: string | null;
  hours_worked: number | null;
  created_at: string;
}

export default function DailyReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [formData, setFormData] = useState({
    content: '',
    tasks_completed: '',
    hours_worked: '',
  });
  const [todayReportExists, setTodayReportExists] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (data) {
      setReports(data);
      const todayReport = data.find((report) => report.date === today);
      setTodayReportExists(!!todayReport);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date().toISOString().split('T')[0];

    try {
      const { error } = await supabase.from('daily_reports').insert([
        {
          date: today,
          content: formData.content,
          tasks_completed: formData.tasks_completed,
          hours_worked: formData.hours_worked
            ? parseFloat(formData.hours_worked)
            : null,
        },
      ]);

      if (error) {
        console.error('Error submitting daily report:', error);
        toast.error(`Failed to submit daily report: ${error.message}`);
      } else {
        toast.success('Daily report submitted successfully');
        setFormData({
          content: '',
          tasks_completed: '',
          hours_worked: '',
        });
        fetchReports();
      }
    } catch (error) {
      console.error('Unexpected error submitting daily report:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const today = formatDate(new Date().toISOString());

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Daily Reports</h1>
        <p className="text-muted-foreground mt-1">
          Submit your daily work reports and track your progress
        </p>
      </div>

      {!todayReportExists && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submit Today's Report
            </CardTitle>
            <p className="text-sm text-muted-foreground">{today}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Work Summary *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Describe what you worked on today..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tasks_completed">Tasks Completed</Label>
                  <Textarea
                    id="tasks_completed"
                    value={formData.tasks_completed}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tasks_completed: e.target.value,
                      }))
                    }
                    placeholder="List the tasks you completed..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours_worked">Hours Worked</Label>
                  <Input
                    id="hours_worked"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={formData.hours_worked}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hours_worked: e.target.value,
                      }))
                    }
                    placeholder="8"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the total hours worked today
                  </p>
                </div>
              </div>

              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {todayReportExists && (
        <Card className="border-none shadow-sm bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-900">
                  Report submitted for today
                </p>
                <p className="text-sm text-green-700">
                  You've already submitted your daily report for {today}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Work Summary</TableHead>
                <TableHead>Tasks Completed</TableHead>
                <TableHead>Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No reports submitted yet
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {formatShortDate(report.date)}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="line-clamp-2 text-sm">{report.content}</p>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm">
                        {report.tasks_completed || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      {report.hours_worked ? `${report.hours_worked}h` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
