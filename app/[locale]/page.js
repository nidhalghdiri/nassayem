// app/[locale]/page.js
"use client";

import Layout from "@/components/layout/Layout";
import Slider1 from "@/components/sections/Slider1";
import Recommended4 from "@/components/sections/Recommended4";
import Testimonial1 from "@/components/sections/Testimonial1";
import LatestNew3 from "@/components/sections/LatestNew3";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState("en");

  useEffect(() => {
    // Get locale from URL
    const locale = pathname.split("/")[1] || "en";
    setCurrentLocale(locale);
  }, [pathname]);

  return (
    <Layout headerStyle={1} footerStyle={1}>
      <Slider1 currentLocale={currentLocale} />
      <Recommended4 currentLocale={currentLocale} />
      <Testimonial1 />
      <LatestNew3 />
    </Layout>
  );
}
