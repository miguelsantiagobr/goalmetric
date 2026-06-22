/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'r2.thesportsdb.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Temporariamente permite todos (para desenvolvimento)
      },
    ],
  },
};

export default nextConfig;