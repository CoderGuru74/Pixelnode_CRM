'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Loader2, Lock, Mail } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Clean up any lingering sessions when the component mounts
  useEffect(() => {
    const clearSession = async () => {
      await supabase.auth.signOut();
      // Clear manual cookies that might be tricking the middleware
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    };
    clearSession();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data?.session) {
        toast.success('Authentication successful! Syncing workspace...');
        
        // Use window.location.href instead of router.push
        // This forces a full page refresh which is REQUIRED for the 
        // middleware to recognize the new session and redirect to the correct role path.
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-1 flex flex-col items-center pb-8">
          <div className="bg-[#7C3AED] p-3 rounded-2xl mb-4 shadow-lg shadow-purple-200">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">PixelNode</CardTitle>
          <CardDescription className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">
            Enterprise Portal Login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="name@pixelnode.com"
                  className="pl-10 h-12 border-slate-200 focus:ring-[#7C3AED]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12 border-slate-200 focus:ring-[#7C3AED]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </span>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Authorized Personnel Only. <br />
              PixelNode Tech Agency © 2026
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}