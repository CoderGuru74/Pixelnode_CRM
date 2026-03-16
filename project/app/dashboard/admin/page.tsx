'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, Briefcase, Clock, AlertCircle, TrendingUp, CheckCircle2, 
  Loader2, Plus, Trash2, CheckCircle, XCircle, Phone, Mail, Layers, Edit3 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

export default function AdminDashboard() {
  const { employee } = useAuth();
  const [stats, setStats] = useState({ activeProjects: 0, totalEmployees: 0, presentToday: 0, pendingLeaves: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', client: '', services: '', email: '', phone: '' });

  const fetchData = async () => {
    try {
      const { count: pCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active');
      const { count: eCount } = await supabase.from('employees').select('*', { count: 'exact', head: true });
      const { data: latest } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(8);

      setStats(prev => ({ ...prev, activeProjects: pCount || 0, totalEmployees: eCount || 0 }));
      setRecentProjects(latest || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- ACTIONS ---
  const handleAddProject = async () => {
    if (!formData.name) return;
    const { error } = await supabase.from('projects').insert([{ 
      name: formData.name, 
      client_name: formData.client, 
      services: formData.services,
      client_email: formData.email,
      client_phone: formData.phone,
      status: 'active' 
    }]);
    
    if (!error) {
      setIsAddOpen(false);
      setFormData({ name: '', client: '', services: '', email: '', phone: '' });
      fetchData();
    } else {
      alert("Error adding project: " + error.message);
    }
  };

  const handleEditClick = (project: any) => {
    setCurrentProject(project);
    setFormData({
      name: project.name,
      client: project.client_name || '',
      services: project.services || '',
      email: project.client_email || '',
      phone: project.client_phone || ''
    });
    setIsEditOpen(true);
  };

  const handleUpdateProject = async () => {
    const { error } = await supabase.from('projects').update({
      name: formData.name,
      client_name: formData.client,
      services: formData.services,
      client_email: formData.email,
      client_phone: formData.phone
    }).eq('id', currentProject.id);

    if (!error) {
      setIsEditOpen(false);
      fetchData();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('projects').update({ status }).eq('id', id);
    if (!error) fetchData();
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Permanently delete this project?")) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) fetchData();
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-[#7C3AED]" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Agency Operations</h1>
          <p className="text-slate-500 font-medium italic">Welcome back, {employee?.name}</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ name: '', client: '', services: '', email: '', phone: '' })} className="bg-[#7C3AED] hover:bg-[#6D28D9] rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-purple-100 transition-transform active:scale-95">
              <Plus className="h-5 w-5" /> Launch Project
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] p-8">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl">New Project Context</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Project Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" />
              <Input placeholder="Client Name" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="rounded-xl" />
              <Input placeholder="Services (Web, Design, etc)" value={formData.services} onChange={e => setFormData({...formData, services: e.target.value})} className="rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl" />
                <Input placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl" />
              </div>
              <Button onClick={handleAddProject} className="w-full bg-[#7C3AED] h-12 rounded-xl font-bold mt-4">Create Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Projects', val: stats.activeProjects, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Team Members', val: stats.totalEmployees, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Present Today', val: `${stats.presentToday} / ${stats.totalEmployees}`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Requests', val: stats.pendingLeaves, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</CardTitle>
              <div className={`${item.bg} p-2.5 rounded-xl`}><item.icon className={`h-4 w-4 ${item.color}`} /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{item.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-8">Recent Activity</h2>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="group p-5 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${project.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-[#7C3AED]'}`}>
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className={`text-base font-black tracking-tight ${project.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{project.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{project.client_name} • {project.services || 'General'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-xl" onClick={() => handleEditClick(project)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {project.status === 'active' && (
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-green-600 hover:bg-green-50 rounded-xl" onClick={() => handleUpdateStatus(project.id, 'completed')}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-red-600 hover:bg-red-50 rounded-xl" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-100/50 flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {project.client_email || 'No Email'}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {project.client_phone || 'No Phone'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <div className="bg-[#7C3AED] p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-100">
            <h3 className="font-black text-xl mb-4">Agency Hub</h3>
            <p className="text-purple-100 text-xs mb-6 font-medium">Monitoring {stats.activeProjects} projects across {stats.totalEmployees} members.</p>
            <Button className="w-full bg-white text-[#7C3AED] hover:bg-purple-50 rounded-2xl font-black text-xs h-12 uppercase tracking-widest">
              Team Overview
            </Button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[2rem] p-8">
          <DialogHeader><DialogTitle className="font-black text-2xl tracking-tight text-slate-900">Refine Project Details</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Project Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" />
            <Input placeholder="Client Name" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="rounded-xl" />
            <Input placeholder="Services" value={formData.services} onChange={e => setFormData({...formData, services: e.target.value})} className="rounded-xl" />
            <Input placeholder="Client Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl" />
            <Input placeholder="Client Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl" />
            <Button onClick={handleUpdateProject} className="w-full bg-[#7C3AED] h-12 rounded-xl font-bold mt-4 shadow-lg shadow-purple-100">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}