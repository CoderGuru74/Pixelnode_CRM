/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  // Note: experimental.serverActions removed as it is default in Next.js 14+
  webpack: (config) => {
    config.module.exprContextCritical = false;
    return config;
  },
};

module.exports = nextConfig;