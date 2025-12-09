import "@/public/css/bootstrap.min.css";
import "@/public/fonts/font-icons.css";
import "@/public/fonts/fonts.css";
import "@/public/css/swiper-bundle.min.css";
import "@/public/css/animate.css";
import "@/public/css/styles.css";

import { DM_Sans, Josefin_Sans } from "next/font/google";
import Script from "next/script";

const dm = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--dm",
  display: "swap",
});
const josefin = Josefin_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--josefin",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export const metadata = {
  title: "Nassayem Salalah - Your Trusted Property Management Partner",
  description:
    "Nassayem Salalah offers premium property management services, including rentals, reservations, and tenant support. Find your perfect stay in Salalah with us!",
  icons: {
    icon: "/images/logo/favicon.png",
  },
  keywords: [
    "property management Salalah",
    "rentals in Salalah",
    "Khareef season accommodation",
    "short-term rentals Salalah",
    "long-term rentals Salalah",
  ],
  openGraph: {
    title: "Nassayem Salalah - Your Trusted Property Management Partner",
    description:
      "Nassayem Salalah offers premium property management services, including rentals, reservations, and tenant support. Find your perfect stay in Salalah with us!",
    url: "https://www.nassayem.com",
    siteName: "Nassayem Salalah",
    images: [
      {
        url: "/images/logo/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nassayem Salalah - Property Management Services",
      },
    ],
    type: "website",
  },
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = params;
  const isArabic = locale === "ar";

  return (
    <html lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <head>
        {/* Add Arabic font if needed */}
        {isArabic && (
          <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        )}
      </head>
      <body className={`${dm.variable} ${josefin.variable} body`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17490889277"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17490889277');
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}
