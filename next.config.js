/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Netlify
  output: 'export',
  trailingSlash: true,
  // Skip type checking and linting during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'maps.googleapis.com', 'maps.gstatic.com'],
  },
  webpack: (config, { isServer }) => {
    // Handle Konva.js for client-side only
    if (isServer) {
      config.externals = [...(config.externals || []), 'konva', 'canvas']
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        fs: false,
        path: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
