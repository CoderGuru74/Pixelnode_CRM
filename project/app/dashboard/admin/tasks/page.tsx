'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Loader2, Trash2, UserCircle, Calendar, 
  Clock, CheckCircle2, Link as LinkIcon, FileText, Zap, AlertCircle, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    assigned_to: '', 
    priority: 'Medium',
    due_date: '',
    reference_link: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: taskData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    const { data: profileData } = await supabase.from('profiles').select('id, full_name, email');
    setTasks(taskData || []);
    setEmployees(profileData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // CRM REAL-TIME ENGINE: Listen for employee submissions
    const channel = supabase.channel('admin-crm-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new.status === 'Completed') {
          toast.success(`Task Submitted: ${payload.new.title}`, {
            description: "Check the 'Done At' timestamp for details.",
            icon: <Zap className="text-yellow-400 fill-yellow-400" />
          });
        }
        fetchData(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCreateTask = async () => {
    if (!formData.title || !formData.assigned_to) return toast.error("Title and Assignee are mandatory.");

    const { error } = await supabase.from('tasks').insert([{
      ...formData,
      status: 'Todo'
    }]);
    
    if (!error) {
      toast.success("Task Dispatched to PixelNode Team");
      setIsAddOpen(false);
      setFormData({ title: '', description: '', assigned_to: '', priority: 'Medium', due_date: '', reference_link: '' });
    } else {
      toast.error(error.message);
    }
  };

  // Logic to determine urgency status
  const getStatusBadge = (task: any) => {
    if (task.status === 'Completed') return { label: 'SUBMITTED', class: 'bg-green-600 text-white animate-pulse' };
    if (!task.due_date) return { label: 'PENDING', class: 'bg-slate-100 text-slate-500' };

    const today = new Date();
    today.setHours(0,0,0,0);
    const deadline = new Date(task.due_date);

    if (deadline < today) return { label: 'OVERDUE', class: 'bg-red-500 text-white' };
    if (deadline.getTime() === today.getTime()) return { label: 'DUE TODAY', class: 'bg-orange-500 text-white' };
    return { label: 'ACTIVE', class: 'bg-[#7C3AED] text-white' };
  };

  if (loading) return <div className="h-full flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#7C3AED]" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-8 border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">PixelNode CRM</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Task Monitor</p>
          </div>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7C3AED] hover:bg-black rounded-2xl px-8 h-14 font-black text-lg shadow-xl shadow-purple-100 transition-all active:scale-95">
              <Plus className="mr-2" /> New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[3rem] p-10 max-w-2xl border-none shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="font-black text-3xl text-slate-900">Task Initialization</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Task Title</label>
                <Input placeholder="e.g., Website Frontend Rebuild" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="rounded-2xl h-14 border-slate-100 bg-slate-50 font-bold" />
              </div>

              {/* Rich Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Instructions (Description)</label>
                <Textarea 
                  placeholder="Explain exactly what needs to be done..." 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="rounded-2xl min-h-[150px] border-slate-100 bg-slate-50 font-medium leading-relaxed" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Employee Select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign To</label>
                  <Select onValueChange={(val) => setFormData({...formData, assigned_to: val})}>
                    <SelectTrigger className="rounded-2xl h-14 font-bold border-slate-100"><SelectValue placeholder="Select Team Member" /></SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      {employees.map(emp => (<SelectItem key={emp.id} value={emp.id} className="font-bold py-3">{emp.full_name || emp.email}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deadline</label>
                  <Input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="rounded-2xl h-14 font-bold border-slate-100" />
                </div>
              </div>

              {/* Reference Link */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reference URL (Figma, Docs, etc.)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="https://figma.com/..." value={formData.reference_link} onChange={e => setFormData({...formData, reference_link: e.target.value})} className="rounded-2xl h-14 pl-12 border-slate-100 font-bold" />
                </div>
              </div>

              <Button onClick={handleCreateTask} className="w-full bg-[#7C3AED] h-16 rounded-2xl font-black text-xl uppercase shadow-lg shadow-purple-50 transition-all mt-4 hover:bg-black">Dispatch Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tasks List */}
      <div className="grid gap-6">
        {tasks.length > 0 ? tasks.map(task => {
          const badge = getStatusBadge(task);
          const assignedUser = employees.find(e => e.id === task.assigned_to);

          return (
            <div key={task.id} className={`bg-white p-8 rounded-[3rem] border flex flex-col gap-6 transition-all hover:shadow-xl ${task.status === 'Completed' ? 'border-green-200 bg-green-50/10' : 'border-slate-100 shadow-sm shadow-slate-100'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-inner shrink-0 ${task.status === 'Completed' ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                    {task.status === 'Completed' ? <CheckCircle2 className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className={`text-2xl font-black tracking-tight ${task.status === 'Completed' ? 'text-slate-400' : 'text-slate-900'}`}>{task.title}</h3>
                      <span className={`${badge.class} text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter shadow-sm`}>{badge.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                        <UserCircle className="h-4 w-4" /> {assignedUser?.full_name || 'PixelNode Member'}
                      </span>
                      {task.due_date && (
                        <span className="text-xs font-bold text-red-500 flex items-center gap-1.5 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-lg">
                          <Calendar className="h-4 w-4" /> Due: {task.due_date}
                        </span>
                      )}
                      {task.status === 'Completed' && task.completed_at && (
                        <span className="text-xs font-black text-green-700 bg-green-100 px-3 py-1 rounded-lg border border-green-200">
                          DONE: {new Date(task.completed_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {task.reference_link && (
                    <Button variant="outline" size="icon" onClick={() => window.open(task.reference_link, '_blank')} className="rounded-2xl border-slate-100 hover:border-[#7C3AED] hover:text-[#7C3AED] h-12 w-12 shadow-sm">
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => supabase.from('tasks').delete().eq('id', task.id).then(fetchData)} className="text-slate-200 hover:text-red-500 hover:bg-red-50 h-12 w-12 rounded-2xl">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Collapsible-style Description in Admin View */}
              {task.description && (
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                    {task.description}
                  </p>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <AlertCircle className="h-12 w-12 text-slate-200 mb-4" />
            <p className="text-lg font-black text-slate-300 uppercase tracking-widest">No Active Assignments</p>
          </div>
        )}
      </div>
    </div>
  );
}