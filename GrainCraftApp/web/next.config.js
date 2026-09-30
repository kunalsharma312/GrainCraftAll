/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.graincraftapp.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.graincraftapp.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.graincraftapp.com/v1',
  },
};

module.exports = nextConfig;
