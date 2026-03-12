'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | null;
}

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchAttendance();

    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching attendance:', error);
      } else {
        setAttendance(data || []);
        const todayRecord = data?.find((record) => record.date === today);
        if (todayRecord) {
          setTodayAttendance(todayRecord);
          setIsCheckedIn(todayRecord.check_in !== null && todayRecord.check_out === null);
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching attendance:', error);
      setAttendance([]);
    }
  };

  const handleCheckIn = async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('attendance')
        .insert({
          date: today,
          check_in: now,
          status: 'Present',
        });

      if (error) {
        console.error('Error checking in:', error);
        toast.error(`Failed to check in: ${error.message}`);
      } else {
        toast.success('Checked in successfully');
        fetchAttendance();
      }
    } catch (error) {
      console.error('Unexpected error checking in:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    const now = new Date().toISOString();
    const checkInTime = new Date(todayAttendance.check_in!);
    const checkOutTime = new Date(now);
    const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out: now,
          total_hours: hours.toFixed(2),
        })
        .eq('id', todayAttendance.id);

      if (error) {
        console.error('Error checking out:', error);
        toast.error(`Failed to check out: ${error.message}`);
      } else {
        toast.success('Checked out successfully');
        fetchAttendance();
      }
    } catch (error) {
      console.error('Unexpected error checking out:', error);
      toast.error('An unexpected error occurred');
    }
  };

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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDbTime = (timestamp: string | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDbDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Attendance</h1>
        <p className="text-muted-foreground mt-1">
          Track your daily attendance and working hours
        </p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Clock In / Clock Out
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-primary tabular-nums">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(currentTime)}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            {!isCheckedIn ? (
              <Button
                size="lg"
                onClick={handleCheckIn}
                className="min-w-[200px]"
                disabled={todayAttendance?.check_in !== undefined}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Clock In
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleCheckOut}
                variant="destructive"
                className="min-w-[200px]"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Clock Out
              </Button>
            )}
          </div>

          {todayAttendance && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Check In</div>
                <div className="text-lg font-semibold">
                  {formatDbTime(todayAttendance.check_in)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Check Out</div>
                <div className="text-lg font-semibold">
                  {formatDbTime(todayAttendance.check_out)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Hours</div>
                <div className="text-lg font-semibold">
                  {todayAttendance.total_hours
                    ? `${todayAttendance.total_hours}h`
                    : '-'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {formatDbDate(record.date)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'Absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDbTime(record.check_in)}</TableCell>
                    <TableCell>{formatDbTime(record.check_out)}</TableCell>
                    <TableCell>
                      {record.total_hours ? `${record.total_hours}h` : '-'}
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
