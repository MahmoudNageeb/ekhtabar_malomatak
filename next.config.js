/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ]
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Next.js 14: استخدم experimental.serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: ['mongodb-memory-server', 'mongoose', 'bcryptjs']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // تجاهل mongodb-memory-server في build الإنتاج
      config.externals = config.externals || [];
      config.externals.push('mongodb-memory-server');
    }
    return config;
  }
};
module.exports = nextConfig;
