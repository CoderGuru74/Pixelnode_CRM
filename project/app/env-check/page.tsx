'use client';

import { useEffect, useState } from 'react';

export default function EnvCheckPage() {
  const [envVars, setEnvVars] = useState({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not found',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Not found',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Not found (server only)',
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Supabase Configuration</h2>
          <div className="mt-2 space-y-2">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
              <p className={`ml-2 ${envVars.supabaseUrl === 'Not found' ? 'text-red-600' : 'text-green-600'}`}>
                {envVars.supabaseUrl}
              </p>
            </div>
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
              <p className={`ml-2 ${envVars.supabaseAnonKey === 'Not found' ? 'text-red-600' : 'text-green-600'}`}>
                {envVars.supabaseAnonKey}
              </p>
            </div>
            <div>
              <strong>SUPABASE_SERVICE_ROLE_KEY:</strong>
              <p className={`ml-2 ${envVars.serviceRoleKey === 'Not found (server only)' ? 'text-orange-600' : 'text-green-600'}`}>
                {envVars.serviceRoleKey}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Browser Information</h2>
          <div className="mt-2 space-y-2">
            <div>
              <strong>User Agent:</strong>
              <p className="ml-2">{typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}</p>
            </div>
            <div>
              <strong>Current URL:</strong>
              <p className="ml-2">{typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
