'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EmployeeTasksPage() {
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = async () => {
    setLoading(true);
    // 1. Get current logged in user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 2. Fetch ONLY tasks assigned to this user's ID
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });
      
      setMyTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMyTasks(); }, []);

  const markCompleted = async (taskId: string) => {
    const { error } = await supabase.from('tasks').update({ status: 'Completed' }).eq('id', taskId);
    if (!error) {
      toast.success("Task updated!");
      fetchMyTasks();
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#7C3AED]" /></div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-black text-slate-900">My Assigned Tasks</h1>
      
      <div className="grid gap-4">
        {myTasks.length > 0 ? myTasks.map(task => (
          <div key={task.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${task.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {task.status === 'Completed' ? <CheckCircle /> : <Clock />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{task.title}</h3>
                <p className="text-sm text-slate-400">{task.description || 'No description'}</p>
              </div>
            </div>
            {task.status !== 'Completed' && (
              <Button onClick={() => markCompleted(task.id)} className="bg-green-600 hover:bg-green-700 rounded-xl font-bold">Done</Button>
            )}
          </div>
        )) : (
          <p className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">No tasks assigned to you yet</p>
        )}
      </div>
    </div>
  );
}