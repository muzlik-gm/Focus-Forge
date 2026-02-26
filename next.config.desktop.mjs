/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export mode for Tauri desktop app
  output: 'export',
  
  // Build output goes to desktop-app/dist directory
  distDir: './desktop-app/dist',
  
  // Disable image optimization for static export compatibility
  images: {
    unoptimized: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Exclude API routes and server-only pages for desktop build
  experimental: {
    // This will be handled by excluding routes in the build
  },
};

export default nextConfig;
