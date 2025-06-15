
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false, // Disable source maps for production
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.gettyimages.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgs.search.brave.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      "https://6000-firebase-studio-1748771317222.cluster-isls3qj2gbd5qs4jkjqvhahfv6.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
