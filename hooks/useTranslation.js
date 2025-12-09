"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/translations";

export function useTranslation(locale) {
  console.log("[useTranslation] locale: ", locale);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  // Load common translations by default
  useEffect(() => {
    async function loadInitialTranslations() {
      try {
        const common = await t(locale, "common", "");
        const header = await t(locale, "header", "");
        const home = await t(locale, "home", "");

        setTranslations({
          common,
          header,
          home,
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to load translations:", error);
        setLoading(false);
      }
    }

    loadInitialTranslations();
  }, [locale]);

  const translate = (namespace, key) => {
    console.log("[useTranslation] translate namespace: ", namespace);
    console.log("[useTranslation] translate key: ", key);
    if (!translations[namespace]) {
      console.warn(`Namespace ${namespace} not loaded`);
      return key;
    }

    const keys = key.split(".");
    let value = translations[namespace];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key
      }
    }

    return value;
  };

  return { translate, loading, translations };
}
