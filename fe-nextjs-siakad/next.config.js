/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Konfigurasi untuk handle PDF libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
      };
    }

    // Optimalkan caching
    config.cache = {
      ...config.cache,
      maxMemoryGenerations: 1,
    };

    return config;
  },
  
  // Transpile dependencies yang diperlukan
  transpilePackages: ['jspdf', 'jspdf-autotable'],
};

module.exports = nextConfig;