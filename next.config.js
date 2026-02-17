/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async rewrites() {
    return [
      {
        source: '/admin1',
        destination: '/admin',
      },
      {
        source: '/admin1/:path*',
        destination: '/admin/:path*',
      },
    ]
  },
}

module.exports = nextConfig
