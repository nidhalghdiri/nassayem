"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function CompactLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState("en");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const segments = pathname.split("/");
    const locale = segments[1] || "en";
    setCurrentLocale(locale);
  }, [pathname]);

  const switchLanguage = () => {
    const newLocale = currentLocale === "en" ? "ar" : "en";
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={switchLanguage}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 group"
      aria-label={`Switch to ${currentLocale === "en" ? "Arabic" : "English"}`}
    >
      {/* Flag display */}
      <div className="relative">
        {/* Current flag */}
        <span
          className={`text-2xl transition-all duration-300 ${
            hovered ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}
        >
          {currentLocale === "en" ? "🇺🇸" : "🇴🇲"}
        </span>

        {/* Hover flag */}
        <span
          className={`absolute top-0 left-0 text-2xl transition-all duration-300 text-center ${
            hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          {currentLocale === "en" ? "🇴🇲" : "🇺🇸"}
        </span>
      </div>

      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-400 transition-all duration-300"></div>
    </button>
  );
}
