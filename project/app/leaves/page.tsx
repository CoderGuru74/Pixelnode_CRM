'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Plus, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';

interface Leave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  employee_name?: string;
  employee_email?: string;
}

export default function LeavesPage() {
  const { employee } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'Casual',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const isAdmin = employee?.email === 'pixelnodeofficial@gmail.com';

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      if (isAdmin) {
        // Admin sees all leaves with employee info
        const { data, error } = await supabase
          .from('leaves')
          .select(`
            *,
            profiles!inner(
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching leaves:', error);
        } else {
          const formattedLeaves = data.map(leave => ({
            ...leave,
            employee_name: leave.profiles.full_name,
            employee_email: leave.profiles.email,
          }));
          setLeaves(formattedLeaves);
        }
      } else {
        // Employee sees only their own leaves
        const { data, error } = await supabase
          .from('leaves')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching leaves:', error);
        } else {
          setLeaves(data);
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching leaves:', error);
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      const { error } = await supabase
        .from('leaves')
        .update({ status: 'Approved' })
        .eq('id', leaveId);

      if (error) {
        console.error('Error approving leave:', error);
        toast.error('Failed to approve leave');
      } else {
        toast.success('Leave approved successfully');
        fetchLeaves();
      }
    } catch (error) {
      console.error('Unexpected error approving leave:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleReject = async (leaveId: string) => {
    try {
      const { error } = await supabase
        .from('leaves')
        .update({ status: 'Rejected' })
        .eq('id', leaveId);

      if (error) {
        console.error('Error rejecting leave:', error);
        toast.error('Failed to reject leave');
      } else {
        toast.success('Leave rejected successfully');
        fetchLeaves();
      }
    } catch (error) {
      console.error('Unexpected error rejecting leave:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('leaves').insert([
        {
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
          status: 'Pending',
        },
      ]);

      if (error) {
        console.error('Error submitting leave request:', error);
        toast.error(`Failed to submit leave request: ${error.message}`);
      } else {
        toast.success('Leave request submitted successfully');
        setOpen(false);
        setFormData({
          leave_type: 'Casual',
          start_date: '',
          end_date: '',
          reason: '',
        });
        fetchLeaves();
      }
    } catch (error) {
      console.error('Unexpected error submitting leave request:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === 'Pending').length,
    approved: leaves.filter((l) => l.status === 'Approved').length,
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {isAdmin ? 'Leave Approvals' : 'Leave Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Review and approve employee leave requests' : 'Request and track your leave applications'}
          </p>
        </div>

        {!isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Request Leave
              </Button>
            </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>New Leave Request</DialogTitle>
                <DialogDescription>
                  Submit a new leave application
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="leave_type">Leave Type *</Label>
                  <Select
                    value={formData.leave_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, leave_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual">Casual Leave</SelectItem>
                      <SelectItem value="Sick">Sick Leave</SelectItem>
                      <SelectItem value="Vacation">Vacation</SelectItem>
                      <SelectItem value="Emergency">Emergency Leave</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          start_date: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          end_date: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="Please provide a reason for your leave"
                    rows={3}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}

        {/* Admin approval dialog */}
        {isAdmin && (
          <div className="text-sm text-muted-foreground">
            {stats.pending} pending requests
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Employee</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 6} className="text-center text-muted-foreground">
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    {isAdmin && (
                      <TableCell>
                        <div>
                          <div className="font-medium">{leave.employee_name}</div>
                          <div className="text-sm text-muted-foreground">{leave.employee_email}</div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      {leave.leave_type}
                    </TableCell>
                    <TableCell>{formatDate(leave.start_date)}</TableCell>
                    <TableCell>{formatDate(leave.end_date)}</TableCell>
                    <TableCell>
                      {calculateDays(leave.start_date, leave.end_date)} days
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm">{leave.reason}</p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {leave.status === 'Pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(leave.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(leave.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
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
