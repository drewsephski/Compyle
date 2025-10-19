/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'octagon-api.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'ufc.com',
      },
      // Add other image domains if necessary
    ],
  },
};

module.exports = nextConfig
