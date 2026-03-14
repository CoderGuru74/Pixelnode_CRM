'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Loader2, RefreshCcw, LogIn, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const isAdmin = user?.email === 'pixelnodeofficial@gmail.com';

  useEffect(() => {
    if (user) fetchAttendance();
  }, [user]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // Fetch the last 20 records
      let query = supabase
        .from('attendance')
        .select('*')
        .order('check_in', { ascending: false })
        .limit(20);

      if (!isAdmin) {
        query = query.eq('employee_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setAttendance(data || []);
      
      // LOGIC FIX: Find the most RECENT record where check_out is null
      const open = data?.find(r => r.employee_id === user?.id && r.check_out === null);
      setActiveSession(open || null);
    } catch (error: any) {
      toast.error("Fetch Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!user?.id) return;
    setBtnLoading(true);
    try {
      if (!activeSession) {
        // CLOCK IN
        const { error } = await supabase.from('attendance').insert({ 
          employee_id: user.id, 
          check_in: new Date().toISOString(),
          status: 'Present'
        });
        if (error) throw error;
        toast.success("Good morning! Clocked in.");
      } else {
        // CLOCK OUT
        const { error } = await supabase
          .from('attendance')
          .update({ check_out: new Date().toISOString() })
          .eq('id', activeSession.id);
        if (error) throw error;
        toast.success("Work finished! Clocked out.");
      }
      await fetchAttendance(); // Refresh list and button state
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <Button variant="outline" size="sm" onClick={fetchAttendance}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>
      
      <Card className="p-12 text-center shadow-lg border-t-4 border-primary">
        <div className="flex flex-col items-center space-y-6">
          <div className={`p-5 rounded-full ${activeSession ? 'bg-green-100' : 'bg-slate-100'}`}>
            <Clock className={`h-12 w-12 ${activeSession ? 'text-green-600' : 'text-slate-400'}`} />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold">{activeSession ? "You're on the clock!" : "Ready to start?"}</h2>
            {activeSession && (
              <p className="text-slate-500 mt-1">Shift started at: {new Date(activeSession.check_in).toLocaleTimeString()}</p>
            )}
          </div>

          <Button 
            size="lg" 
            disabled={btnLoading}
            className={`w-64 h-14 text-lg ${activeSession ? 'bg-red-600 hover:bg-red-700' : 'bg-primary'}`}
            onClick={handleAction}
          >
            {btnLoading ? (
              <Loader2 className="animate-spin" />
            ) : activeSession ? (
              <><LogOut className="mr-2" /> Clock Out</>
            ) : (
              <><LogIn className="mr-2" /> Clock In</>
            )}
          </Button>
        </div>
      </Card>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${r.check_out ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'}`}>
                    {r.check_out ? 'Finished' : 'ACTIVE'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{new Date(r.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell>
                <TableCell>{r.check_out ? new Date(r.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}</TableCell>
                <TableCell className="text-right text-slate-500">{new Date(r.check_in).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}