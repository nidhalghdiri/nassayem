/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ Enable built-in i18n
  // i18n: {
  //   locales: ["en", "ar"],
  //   defaultLocale: "en",
  //   localeDetection: true, // Auto-detect user's language
  // },
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
