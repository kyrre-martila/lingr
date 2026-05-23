/** @type {import('next').NextConfig} */
const internalApiBaseUrl = String(process.env.LINGR_INTERNAL_API_BASE_URL || 'http://localhost:4000').trim().replace(/\/$/, '')

const nextConfig = {
  transpilePackages: ['@lingr/shared'],
  async rewrites() {
    return [
      {
        source: '/api/lingr/:path*',
        destination: `${internalApiBaseUrl}/:path*`
      }
    ]
  }
}

export default nextConfig
