'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      } else if (data?.session) {
        toast.success("Syncing session with PixelNode server...");

        // 🛠️ SERVER-SIDE COOKIE SETTING
        // This forces the server to acknowledge the session before redirect
        const { access_token, refresh_token } = data.session;
        
        try {
          const response = await fetch('/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token,
              refresh_token,
            }),
          });

          if (response.ok) {
            // Server has set cookies, now redirect
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 500);
          } else {
            throw new Error('Failed to set session cookies');
          }
        } catch (cookieError) {
          console.error('Cookie setting error:', cookieError);
          toast.error('Failed to sync session. Please try again.');
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Pixel<span className="text-[#7C3AED]">Node</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-sm uppercase tracking-widest">Tech Agency Portal</p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900">Admin Login</CardTitle>
            <CardDescription className="text-slate-500">
              Please enter your credentials to manage the portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pixelnode.com"
                  className="h-12 border-slate-200 focus:ring-[#7C3AED]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" id="password-label" className="text-slate-700 font-semibold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 border-slate-200 focus:ring-[#7C3AED]"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-12 font-bold transition-all transform active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Login to Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-slate-400 text-xs mt-8">
          &copy; 2026 PixelNode. All rights reserved.
        </p>
      </div>
    </div>
  );
}