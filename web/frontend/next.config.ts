import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      {
        // Proxy para imagens de capa do MangaDex (evita hotlink protection)
        source: '/mangadex-covers/:path*',
        destination: 'https://uploads.mangadex.org/covers/:path*',
      },
    ];
  },
};

export default nextConfig;
