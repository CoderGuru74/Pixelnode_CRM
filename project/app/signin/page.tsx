'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from '../auth/actions';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleForm(formData: FormData) {
    setIsLoading(true);
    const result = await signIn(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black">
            Pixel<span className="text-[#7C3AED]">Node</span> CRM
          </h1>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Standard HTML form that uses the Server Action */}
            <form action={handleForm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="admin@pixelnode.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required placeholder="••••••••" />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]" 
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}