/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://nassayem.com",
  },
  // Remove built-in i18n since we're using custom middleware
  // i18n: {
  //   locales: ["en", "ar"],
  //   defaultLocale: "en",
  //   localeDetection: false, // Disable built-in detection
  // },
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Important for VPS deployment
  output: "standalone",
  // Enable trailing slashes
  trailingSlash: false,
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Images configuration
  images: {
    unoptimized: true, // Disable image optimization if having issues
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add alias for custom Prisma client
      config.resolve.alias = {
        ...config.resolve.alias,
        ".prisma/client/default": require("path").resolve(
          __dirname,
          "app/generated/prisma/client"
        ),
        "@prisma/client": require("path").resolve(
          __dirname,
          "app/generated/prisma/client"
        ),
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://nassayem.com" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
