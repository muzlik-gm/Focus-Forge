/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server mode - API routes enabled
  // Desktop app will connect to this server
  
  // Disable image optimization for better compatibility
  images: {
    unoptimized: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
