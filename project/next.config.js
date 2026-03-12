/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  webpack: (config) => {
    // This suppresses the "Critical dependency: the request of a dependency is an expression" 
    // warning caused by @supabase/realtime-js.
    config.module.exprContextCritical = false;
    return config;
  },
};

module.exports = nextConfig;