'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Loader2, Trash2, UserCircle, Briefcase, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    priority: 'Medium'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all tasks
      const { data: taskData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      // 2. Fetch all profiles
      const { data: profileData } = await supabase.from('profiles').select('id, full_name, email');
      
      setTasks(taskData || []);
      setEmployees(profileData || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateTask = async () => {
    // --- DEBUG LOGS ---
    console.log("DEBUG: Attempting to create task...");
    console.log("DEBUG: Target UUID (assigned_to):", formData.assigned_to);
    console.log("DEBUG: Payload Data:", formData);

    if (!formData.title || !formData.assigned_to) {
      return toast.error("Title and Assignee are required");
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      assigned_to: formData.assigned_to, 
      status: 'Todo',
      priority: formData.priority
    };

    const { data, error } = await supabase.from('tasks').insert([payload]).select();
    
    if (!error) {
      console.log("DEBUG: Success!", data);
      toast.success("Task assigned successfully");
      setIsAddOpen(false);
      setFormData({ title: '', description: '', assigned_to: '', priority: 'Medium' });
      fetchData();
    } else {
      // --- RLS ERROR LOGGING ---
      console.error("DEBUG: Supabase Insertion Error:", error);
      if (error.code === '42501') {
        toast.error("Security Block: RLS Policy prevents insertion. Run the SQL fix.");
      } else {
        toast.error(error.message);
      }
    }
  };

  // Helper to find employee name from ID
  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? (emp.full_name || emp.email) : "Unknown Employee";
  };

  if (loading) return <div className="h-full flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#7C3AED]" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Task Control</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] rounded-2xl font-bold h-12 shadow-lg shadow-purple-100 transition-all">
              <Plus className="mr-2 h-5 w-5" /> Assign New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-8 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl tracking-tight">Task Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Task Name</label>
                <Input placeholder="Reviewing Website UI" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="rounded-xl border-slate-100" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes</label>
                <Input placeholder="Check for responsiveness on mobile..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl border-slate-100" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assignee</label>
                <Select onValueChange={(val) => setFormData({...formData, assigned_to: val})}>
                  <SelectTrigger className="rounded-xl border-slate-100">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name || emp.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleCreateTask} className="w-full bg-[#7C3AED] h-12 rounded-xl font-black uppercase tracking-widest text-xs mt-4 shadow-lg shadow-purple-50 transition-all active:scale-95">
                Confirm & Send Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tasks.length > 0 ? tasks.map(task => (
          <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-purple-50 group-hover:text-[#7C3AED] transition-colors">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">{task.title}</h3>
                <div className="flex gap-4 mt-1">
                  <span className="text-[10px] font-bold text-[#7C3AED] flex items-center gap-1 uppercase tracking-wider">
                    <UserCircle className="h-3.5 w-3.5" /> {getEmployeeName(task.assigned_to)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                     Status: {task.status}
                  </span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => supabase.from('tasks').delete().eq('id', task.id).then(fetchData)} 
              className="text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">No tasks assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}