/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Cała podsieć domowa — router przydziela adres przez DHCP, więc pojedynczy IP się dezaktualizuje
  allowedDevOrigins: ['192.168.1.*'],
  images: {
    // Zdjęcia z Google Drive przechowywane na serwerze 7 dni (domyślnie 4 h) — rzadsze
    // pobieranie z Drive. Nowy plik ma nowy link, więc wymiana zdjęcia działa od razu;
    // tylko nadpisanie pliku na Drive nową wersją pokaże się z opóźnieniem.
    minimumCacheTTL: 604800,
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
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
