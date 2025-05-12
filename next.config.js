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
  },
  async headers() {
    return [
      {
        // This applies to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig