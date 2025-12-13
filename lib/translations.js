// lib/translations.js
import enCommon from "@/public/locales/en/common.json";
import enHeader from "@/public/locales/en/header.json";
import enHome from "@/public/locales/en/home.json";
import enFooter from "@/public/locales/en/footer.json";
import enAbout from "@/public/locales/en/about.json";
import enContact from "@/public/locales/en/contact.json";
import arCommon from "@/public/locales/ar/common.json";
import arHeader from "@/public/locales/ar/header.json";
import arHome from "@/public/locales/ar/home.json";
import arFooter from "@/public/locales/ar/footer.json";
import arAbout from "@/public/locales/ar/about.json";
import arContact from "@/public/locales/ar/contact.json";

// Static translation object
const translations = {
  en: {
    common: enCommon,
    header: enHeader,
    home: enHome,
    footer: enFooter,
    about: enAbout,
    contact: enContact,
  },
  ar: {
    common: arCommon,
    header: arHeader,
    home: arHome,
    footer: arFooter,
    about: arAbout,
    contact: arContact,
  },
};
// Simple translation function
export function t(locale, namespace, key) {
  // console.log("t function locale: ", locale);
  // console.log("t function namespace: ", namespace);
  // console.log("t function key: ", key);
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
