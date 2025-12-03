import "/public/css/bootstrap.min.css";
import "/public/fonts/font-icons.css";
import "/public/fonts/fonts.css";
// import "/public/css/nouislider.min.css"
import "/public/css/swiper-bundle.min.css";
import "/public/css/animate.css";
import "/public/css/styles.css";

import { DM_Sans, Josefin_Sans } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

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

export const metadata = {
  title: "Nassayem Salalah - Your Trusted Property Management Partner",
  description:
    "Nassayem Salalah offers premium property management services, including rentals, reservations, and tenant support. Find your perfect stay in Salalah with us!",
  icons: {
    icon: "/images/logo/favicon.png", // Path to your favicon
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
    url: "https://www.nassayem.com ", // Replace with your actual domain
    siteName: "Nassayem Salalah",
    images: [
      {
        url: "/images/logo/og-image.jpg", // Path to your Open Graph image (recommended size: 1200x630)
        width: 1200,
        height: 630,
        alt: "Nassayem Salalah - Property Management Services",
      },
    ],
    type: "website",
  },
};

const locales = ["en", "ar"];
export default async function RootLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={`${dm.variable} ${josefin.variable} body`}>
        {/* Add the Google Tag Scripts here */}
        {/* This first script loads the external gtag.js file */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17490889277"
          strategy="afterInteractive" // Loads after the page is interactive for best performance
        />

        {/* This second script contains the initialization code */}
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17490889277');
          `}
        </Script>
        {/* End of Google Tag */}

        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
