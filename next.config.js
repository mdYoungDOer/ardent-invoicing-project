/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // serverComponentsExternalPackages moved to serverExternalPackages in Next.js 15
  },

  // External packages for server components
  serverExternalPackages: ['@supabase/supabase-js', '@sendgrid/mail'],

  // Image optimization
  images: {
    domains: [
      'localhost',
      'ardentinvoicing.com',
      'supabase.co',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://ardentinvoicing.com' 
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sign-in',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/sign-up',
        destination: '/signup',
        permanent: true,
      },
    ];
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/paystack/:path*',
        destination: 'https://api.paystack.co/:path*',
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configurations if needed
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // Output configuration for deployment
  output: 'standalone',

  // Compression
  compress: true,

  // Power optimization
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // Bundle analyzer (uncomment to analyze bundle size)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //     };
  //   }
  //   return config;
  // },

  // PWA configuration (handled by separate PWA plugin)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  //   disable: process.env.NODE_ENV === 'development',
  // },

  // Internationalization (if needed in the future)
  // i18n: {
  //   locales: ['en', 'fr'],
  //   defaultLocale: 'en',
  // },

  // Trailing slash configuration
  trailingSlash: false,

  // Asset prefix for CDN (if using CDN)
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.ardentinvoicing.com' : '',

  // Base path (if deploying to subdirectory)
  // basePath: '/ardent-invoicing',

  // Custom build directory
  distDir: '.next',

  // Generate ETags
  generateEtags: true,

  // HTTP agent configuration
  httpAgentOptions: {
    keepAlive: true,
  },
};

module.exports = nextConfig;
