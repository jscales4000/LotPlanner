/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
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
