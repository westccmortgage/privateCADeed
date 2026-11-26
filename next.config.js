/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/privacy", destination: "/legal#privacy", statusCode: 301 },
      { source: "/terms", destination: "/legal#terms", statusCode: 301 },
    ];
  },
};

module.exports = nextConfig;
