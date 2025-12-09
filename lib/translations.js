// lib/translations.js
import enCommon from "@/public/locales/en/common.json";
import enHeader from "@/public/locales/en/header.json";
import enHome from "@/public/locales/en/home.json";
import arCommon from "@/public/locales/ar/common.json";
import arHeader from "@/public/locales/ar/header.json";
import arHome from "@/public/locales/ar/home.json";

// Static translation object
const translations = {
  en: {
    common: enCommon,
    header: enHeader,
    home: enHome,
  },
  ar: {
    common: arCommon,
    header: arHeader,
    home: arHome,
  },
};
// Simple translation function
export function t(locale, namespace, key) {
  console.log("t function locale: ", locale);
  console.log("t function namespace: ", namespace);
  console.log("t function key: ", key);
  const localeTranslations = translations[locale] || translations.en;
  const namespaceTranslations = localeTranslations[namespace] || {};

  const keys = key.split(".");
  let value = namespaceTranslations;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(
        `Translation key "${key}" not found in ${namespace} for ${locale}`
      );
      return key; // Fallback to key
    }
  }

  return value;
}

// Hook for client components
export function useTranslations(locale) {
  const translate = (namespace, key) => t(locale, namespace, key);
  return translate;
}
