// hooks/useWow.js
"use client";

import { useEffect } from "react";

export function useWow(config = {}) {
  useEffect(() => {
    let wowInstance = null;

    const initWow = async () => {
      try {
        const wowModule = await import("wowjs");
        const WOW = wowModule.default || wowModule.WOW;

        wowInstance = new WOW({
          boxClass: "wow",
          animateClass: "animated",
          offset: 0,
          mobile: true,
          live: false,
          ...config,
        });

        wowInstance.init();

        // Re-init on route changes
        const handleRouteChange = () => {
          if (wowInstance && wowInstance.sync) {
            wowInstance.sync();
          }
        };

        // Listen for Next.js route changes
        if (typeof window !== "undefined") {
          window.addEventListener("routeChangeComplete", handleRouteChange);
        }

        return () => {
          if (wowInstance && wowInstance.stop) {
            wowInstance.stop();
          }
          if (typeof window !== "undefined") {
            window.removeEventListener(
              "routeChangeComplete",
              handleRouteChange
            );
          }
        };
      } catch (error) {
        console.warn("WOW.js initialization failed:", error);
      }
    };

    initWow();
  }, [config]);
}
