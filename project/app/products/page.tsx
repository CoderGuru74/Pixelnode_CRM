'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, TrendingUp, DollarSign, ShoppingCart, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';

interface Project {
  id: string;
  client_name: string;
  project_name: string;
  amount: number;
  category: 'Website' | 'App' | 'Digital Marketing' | 'Branding' | 'Automation';
  status: 'Active' | 'Completed' | 'On Hold';
  created_at: string;
}

export default function ProjectsPage() {
  const { employee } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    amount: '',
    category: 'Website' as Project['category'],
  });

  const isAdmin = employee?.is_admin || false;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        // Fallback to mock data if table doesn't exist yet
        const mockProjects: Project[] = [
          {
            id: '1',
            client_name: 'Tech Corp',
            project_name: 'E-commerce Website',
            amount: 5000,
            category: 'Website',
            status: 'Active',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            client_name: 'StartupXYZ',
            project_name: 'Mobile Application',
            amount: 8000,
            category: 'App',
            status: 'Active',
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            client_name: 'Brand Agency',
            project_name: 'Brand Identity Design',
            amount: 3000,
            category: 'Branding',
            status: 'Completed',
            created_at: new Date().toISOString(),
          },
          {
            id: '4',
            client_name: 'Marketing Co',
            project_name: 'Digital Campaign',
            amount: 2500,
            category: 'Digital Marketing',
            status: 'Active',
            created_at: new Date().toISOString(),
          },
        ];
        setProjects(mockProjects);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching projects:', error);
      setProjects([]);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error('Only admins can create projects');
      return;
    }

    try {
      const { error } = await supabase.from('projects').insert([
        {
          ...formData,
          amount: parseFloat(formData.amount),
          status: 'Active',
        },
      ]);

      if (error) {
        console.error('Error creating project:', error);
        toast.error(`Failed to create project: ${error.message}`);
      } else {
        toast.success('Project created successfully');
        setOpen(false);
        setFormData({
          client_name: '',
          project_name: '',
          amount: '',
          category: 'Website',
        });
        fetchProjects();
      }
    } catch (error) {
      console.error('Unexpected error creating project:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const totalProjects = projects.length;
  const totalSales = projects.reduce((acc, p) => acc + p.amount, 0);
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;

  const stats = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Revenue',
      value: `$${totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed',
      value: completedProjects,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Website':
        return 'bg-blue-100 text-blue-800';
      case 'App':
        return 'bg-green-100 text-green-800';
      case 'Digital Marketing':
        return 'bg-purple-100 text-purple-800';
      case 'Branding':
        return 'bg-orange-100 text-orange-800';
      case 'Automation':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Project Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your agency's projects and track revenue
          </p>
        </div>

        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateProject}>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to your portfolio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client_name">Client Name *</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, client_name: e.target.value }))
                        }
                        placeholder="Enter client name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project_name">Project Name *</Label>
                      <Input
                        id="project_name"
                        value={formData.project_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, project_name: e.target.value }))
                        }
                        placeholder="Enter project name"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, amount: e.target.value }))
                        }
                        placeholder="5000"
                        required
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value as Project['category'] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="App">App</SelectItem>
                          <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                          <SelectItem value="Branding">Branding</SelectItem>
                          <SelectItem value="Automation">Automation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Project</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.project_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.client_name}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge
                    variant="outline"
                    className={getCategoryColor(project.category)}
                  >
                    {project.category}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-lg font-bold">${project.amount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
