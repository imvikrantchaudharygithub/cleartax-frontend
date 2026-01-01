/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Optimize for production
  reactStrictMode: true,
  // Output configuration
  output: 'standalone',
}

module.exports = nextConfig

