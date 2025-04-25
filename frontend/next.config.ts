import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  source: '/api/:path*',
  destination: 'http://localhost:5000/api/:path*',
};

export default nextConfig;
