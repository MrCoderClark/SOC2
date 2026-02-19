/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@soc2/shared", "@soc2/database"],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

module.exports = nextConfig;
