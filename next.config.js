/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile three.js related packages to prevent ESM/CJS issues
  transpilePackages: [
    'three', 
    'react-globe.gl', 
    'globe.gl', 
    'three-globe', 
    'three-render-objects'
  ],
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/public/rakı frame/**',
        '**/public/rakı frame 2/**',
        '**/public/sparkling frame/**',
        '**/public/videos/**',
      ],
    };
    return config;
  },
};

module.exports = nextConfig;
