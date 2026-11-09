/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'https://api-classiq.onrender.com/:path*' }]
  },
}

export default nextConfig
