/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // نادیده گرفتن خطاهای TypeScript در زمان build
    ignoreBuildErrors: true,
  },
  eslint: {
    // نادیده گرفتن خطاهای ESLint در زمان build
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
