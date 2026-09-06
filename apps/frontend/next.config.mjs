/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'faridkhoshdel.ir',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};
export default nextConfig;
