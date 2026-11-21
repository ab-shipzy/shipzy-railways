/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdfkit', 'bwip-js'],
  },
};

module.exports = nextConfig;
