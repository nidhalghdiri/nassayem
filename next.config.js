/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  i18n: {
    locales: ["en", "ar"],
    defaultLocale: "en",
    localeDetection: true,
  },
  // For Arabic RTL support
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
