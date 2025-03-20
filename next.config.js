// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['media.istockphoto.com', 'encrypted-tbn0.gstatic.com', 'images.unsplash.com', 'images.unsplash.com', 'encrypted-tbn1.gstatic.com'],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Add the following line to see output in the console
    config.infrastructureLogging = { debug: /webpack/ }
    return config
  }
}

module.exports = nextConfig