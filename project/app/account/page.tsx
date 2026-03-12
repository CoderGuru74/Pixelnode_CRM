'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AccountPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: '',
    department: '',
    employee_id: '',
    reporting_manager: '',
    joining_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // First create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          }
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        toast.error(`Failed to create user account: ${authError.message}`);
        return;
      }

      // Then create the employee record
      const { error: employeeError } = await supabase.from('employees').insert([
        {
          ...formData,
          is_admin: false,
          user_id: authData.user?.id, // Link to auth user
        },
      ]);

      if (employeeError) {
        console.error('Error creating employee record:', employeeError);
        toast.error(`Failed to create employee record: ${employeeError.message}`);
        // Optionally, you might want to delete the auth user if employee creation fails
        if (authData.user?.id) {
          await supabase.auth.admin.deleteUser(authData.user.id);
        }
      } else {
        toast.success('Employee created successfully');
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          role: '',
          department: '',
          employee_id: '',
          reporting_manager: '',
          joining_date: '',
        });
      }
    } catch (error) {
      console.error('Unexpected error in registration:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Admin Account Management</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage employee accounts
        </p>
      </div>

      <Card className="border-none shadow-sm max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New Employee
          </CardTitle>
          <CardDescription>
            Add a new employee to the PixelNode team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@pixelnode.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID *</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleChange('employee_id', e.target.value)}
                  placeholder="EMP012"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Tech Street, Bangalore"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">Human Resources</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  placeholder="Product Developer Intern"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporting_manager">Reporting Manager</Label>
                <Input
                  id="reporting_manager"
                  value={formData.reporting_manager}
                  onChange={(e) => handleChange('reporting_manager', e.target.value)}
                  placeholder="Manager Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date *</Label>
                <Input
                  id="joining_date"
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => handleChange('joining_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Create Employee</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    address: '',
                    role: '',
                    department: '',
                    employee_id: '',
                    reporting_manager: '',
                    joining_date: '',
                  })
                }
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
