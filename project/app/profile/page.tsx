'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, MapPin, Building, Calendar, Users, Shield, Key, Bell } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { employee } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (employee) {
      setFormData({
        phone: employee.phone || '',
        address: employee.address || '',
      });
    }
  }, [employee]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSaveChanges = async () => {
    if (!employee) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', employee.user_id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and settings
        </p>
      </div>

      {/* Profile Header */}
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <p className="text-muted-foreground">
                  {employee.email === 'pixelnodeofficial@gmail.com' ? 'Head of Development' : employee.role}
                </p>
                {employee.is_admin && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    <Shield className="h-3 w-3" />
                    Administrator
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{employee.employee_id}</div>
                  <div className="text-sm text-muted-foreground">Employee ID</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{employee.department}</div>
                  <div className="text-sm text-muted-foreground">Department</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{formatDate(employee.joining_date)}</div>
                  <div className="text-sm text-muted-foreground">Joined</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={employee.name.split(' ')[0]} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={employee.email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={employee.name.split(' ')[1] || ''} />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={employee.email === 'pixelnodeofficial@gmail.com' ? 'Head of Development' : employee.role} disabled />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" defaultValue={employee.department} disabled />
                  </div>
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input id="employeeId" defaultValue={employee.employee_id} disabled />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reportingManager">Reporting Manager</Label>
                    <Input id="reportingManager" defaultValue={employee.reporting_manager || 'Not assigned'} disabled />
                  </div>
                  <div>
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input id="joiningDate" defaultValue={formatDate(employee.joining_date)} disabled />
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                <div className="text-muted-foreground">
                  Team member information will be displayed here once organization data is fully integrated.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Change Password</div>
                      <div className="text-sm text-muted-foreground">
                        Update your account password
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Notification Preferences</div>
                      <div className="text-sm text-muted-foreground">
                        Manage how you receive notifications
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Login Activity</h3>
                <div className="text-muted-foreground">
                  Recent login activity and session information will be displayed here.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
              
