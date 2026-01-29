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
};

module.exports = nextConfig;
