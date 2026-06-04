/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    const API_GATEWAY = process.env.API_GATEWAY_URL;

    return [
      {
        source: '/api/:path*',
        destination: `${API_GATEWAY}/:path*`,
      },
    ];
  },
};

export default nextConfig;