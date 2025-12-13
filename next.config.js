/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove built-in i18n since we're using custom middleware
  // i18n: {
  //   locales: ["en", "ar"],
  //   defaultLocale: "en",
  //   localeDetection: false, // Disable built-in detection
  // },
  compiler: {
    styledComponents: true,
  },
  // Important for VPS deployment
  output: "standalone",
  // Enable trailing slashes
  trailingSlash: false,
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Images configuration
  images: {
    unoptimized: true, // Disable image optimization if having issues
  },
};

module.exports = nextConfig;
