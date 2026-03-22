'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  Loader2, CheckCircle2, Clock, Calendar, 
  ExternalLink, FileText, AlertCircle, Zap, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMyTasks = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', user.id)
      .order('status', { ascending: false }) // Keep active tasks at top
      .order('created_at', { ascending: false });
    
    if (!error) setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMyTasks();
    
    // LIVE SYNC: Refresh if Admin updates the task while employee is looking
    const channel = supabase.channel('employee-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `assigned_to=eq.${user?.id}` }, () => fetchMyTasks())
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsDone = async (taskId: string, title: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: 'Completed',
        completed_at: new Date().toISOString() 
      })
      .eq('id', taskId);

    if (!error) {
      toast.success(`Task "${title}" Submitted!`, {
        description: "Admin has been notified of your completion.",
        icon: <Zap className="text-yellow-400 fill-yellow-400" />
      });
      fetchMyTasks();
    } else {
      toast.error("Submission failed. Please try again.");
    }
  };

  // Logic to show urgency to employee
  const getDeadlineStatus = (dueDate: string, status: string) => {
    if (status === 'Completed' || !dueDate) return null;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const deadline = new Date(dueDate);

    if (deadline < today) return <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">OVERDUE</span>;
    if (deadline.getTime() === today.getTime()) return <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full">DUE TODAY</span>;
    return <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Upcoming</span>;
  };

  if (loading) return <div className="h-full flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#7C3AED]" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b pb-8 border-slate-100">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">My Workspace</h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">PixelNode Delivery Unit • Active Assignments</p>
      </div>

      <div className="grid gap-6">
        {tasks.length > 0 ? tasks.map(task => (
          <div key={task.id} className={`bg-white p-8 rounded-[3rem] border-2 transition-all flex flex-col gap-6 ${task.status === 'Completed' ? 'opacity-50 grayscale border-slate-50 bg-slate-50/30' : 'border-slate-100 shadow-sm hover:border-[#7C3AED]/30'}`}>
            
            {/* Task Top Row */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${task.status === 'Completed' ? 'bg-slate-200 text-slate-500' : 'bg-[#7C3AED]/10 text-[#7C3AED]'}`}>
                  {task.status === 'Completed' ? <CheckCircle2 className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className={`text-2xl font-black tracking-tight text-slate-900 ${task.status === 'Completed' && 'line-through opacity-50'}`}>{task.title}</h3>
                    {getDeadlineStatus(task.due_date, task.status)}
                  </div>
                  <div className="flex gap-4 mt-1">
                    {task.due_date && (
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5" /> Deadline: {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {task.status !== 'Completed' && (
                <Button 
                  onClick={() => markAsDone(task.id, task.title)} 
                  className="bg-black hover:bg-[#7C3AED] text-white rounded-2xl font-black uppercase text-xs px-8 h-12 shadow-lg transition-all active:scale-90"
                >
                  Submit Work <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Instruction Box */}
            <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100 relative group">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Instructions</h4>
              <p className="text-slate-700 text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                {task.description || "No specific instructions provided for this assignment."}
              </p>
              
              {/* Reference Link Area */}
              {task.reference_link && (
                <div className="mt-6 pt-4 border-t border-slate-200/50">
                  <a 
                    href={task.reference_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-black text-[#7C3AED] uppercase hover:bg-[#7C3AED] hover:text-white px-4 py-2 rounded-xl border border-[#7C3AED]/20 transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open Project Reference
                  </a>
                </div>
              )}
            </div>

            {/* Footer status for completed tasks */}
            {task.status === 'Completed' && (
              <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase">
                <CheckCircle2 className="h-4 w-4" /> Successfully submitted on {new Date(task.completed_at).toLocaleString()}
              </div>
            )}
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <AlertCircle className="h-12 w-12 text-slate-200 mb-4" />
            <p className="text-lg font-black text-slate-300 uppercase tracking-[0.2em]">Zero Active Tasks</p>
            <p className="text-xs font-bold text-slate-400 mt-1">Check back later for new assignments.</p>
          </div>
        )}
      </div>
    </div>
  );
}