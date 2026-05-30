/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/id/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'ireland.apollo.olxcdn.com',
        port: '',
        pathname: '/v1/files/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'mextra.pl',
        port: '',
        pathname: '/**',
        search: '',
      }
    ],
  },
};

export default nextConfig;
