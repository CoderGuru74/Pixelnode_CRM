'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Briefcase, 
  Plus, 
  Loader2, 
  Trash2, 
  IndianRupee, 
  Search, 
  TrendingUp, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Using generic internal names to prevent any DB column name conflicts
  const [inputData, setInputData] = useState({ 
    pName: '', 
    pClient: '', 
    pService: '', 
    pBudget: '',
    pEmail: '',
    pPhone: ''
  });

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleAddProject = async () => {
    if (!inputData.pName) return alert("Project Name is required");

    // EXPLICIT MAPPING: This ensures ONLY correct columns are sent to Supabase
    const payload = {
      name: inputData.pName, 
      client_name: inputData.pClient,
      services: inputData.pService,
      amount: parseFloat(inputData.pBudget) || 0,
      client_email: inputData.pEmail,
      client_phone: inputData.pPhone,
      status: 'active'
    };

    const { error } = await supabase.from('projects').insert([payload]);
    
    if (!error) {
      setIsAddOpen(false);
      setInputData({ pName: '', pClient: '', pService: '', pBudget: '', pEmail: '', pPhone: '' });
      fetchProjects();
    } else {
      console.error("Supabase Submission Error:", error);
      alert(`Database rejected the request: ${error.message}`);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Permanently delete this project?")) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) fetchProjects();
  };

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = projects.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  if (loading) return (
    <div className="h-full flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin h-12 w-12 text-[#7C3AED]" />
    </div>
  );

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Agency Operations</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Live Project Directory</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] rounded-2xl font-black h-14 px-8 shadow-xl shadow-purple-100 transition-all active:scale-95">
              <Plus className="mr-2 h-6 w-6 stroke-[3px]" /> Initialize Project
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[3rem] p-10 max-w-md border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-black text-3xl tracking-tighter">New Operation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <Input placeholder="Project Name" value={inputData.pName} onChange={e => setInputData({...inputData, pName: e.target.value})} className="rounded-2xl border-slate-100 h-12" />
              <Input placeholder="Client Name" value={inputData.pClient} onChange={e => setInputData({...inputData, pClient: e.target.value})} className="rounded-2xl border-slate-100 h-12" />
              <Input placeholder="Services Provided" value={inputData.pService} onChange={e => setInputData({...inputData, pService: e.target.value})} className="rounded-2xl border-slate-100 h-12" />
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Budget" type="number" value={inputData.pBudget} onChange={e => setInputData({...inputData, pBudget: e.target.value})} className="rounded-2xl border-slate-100 h-12 pl-10" />
              </div>
              <Button onClick={handleAddProject} className="w-full bg-[#7C3AED] h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs mt-6 shadow-lg shadow-purple-50">
                Launch to Database
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-2">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-14 w-14 rounded-3xl bg-purple-50 flex items-center justify-center text-[#7C3AED]">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Value</p>
              <h3 className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-2">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-14 w-14 rounded-3xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</p>
              <h3 className="text-2xl font-black text-slate-900">{projects.length} Active</h3>
            </div>
          </CardContent>
        </Card>

        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#7C3AED] transition-colors" />
          <Input 
            placeholder="Search Registry..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-full rounded-[2.5rem] border-none shadow-sm bg-white pl-14 font-bold text-slate-600 placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="px-10 py-6 font-black text-[11px] uppercase text-slate-400 tracking-[0.2em]">Project / Client</TableHead>
              <TableHead className="font-black text-[11px] uppercase text-slate-400 tracking-[0.2em]">Investment</TableHead>
              <TableHead className="font-black text-[11px] uppercase text-slate-400 tracking-[0.2em]">Status</TableHead>
              <TableHead className="text-right px-10 font-black text-[11px] uppercase text-slate-400 tracking-[0.2em]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map(p => (
                <TableRow key={p.id} className="group border-slate-50 hover:bg-slate-50/40 transition-all">
                  <TableCell className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#7C3AED] group-hover:text-white transition-all duration-300">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-base tracking-tight">{p.name}</p>
                        <p className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-widest">{p.client_name || 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-black text-slate-700">
                      <IndianRupee className="h-3 w-3 text-slate-300" />
                      {p.amount?.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50/50 text-blue-600 rounded-full w-fit border border-blue-100">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{p.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteProject(p.id)} 
                      className="text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-slate-300 font-black uppercase text-xs tracking-widest">
                  No records found in current view
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}