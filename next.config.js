/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable any experimental features you need
  },
  sassOptions: {
    includePaths: ['./src/styles'],
  },
}

module.exports = nextConfig
