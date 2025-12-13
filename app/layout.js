import { DM_Sans } from "next/font/google";
import { Providers } from "./providers";

const dm = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Nassayem Salalah",
  description: "Property Management in Salalah, Oman",
  // Add Open Graph metadata
  openGraph: {
    title: "Nassayem Salalah - Property Management",
    description:
      "Your trusted partner for property management in Salalah, Oman",
    url: "https://nassayem.com",
    siteName: "Nassayem Salalah",
    images: [
      {
        url: "/images/logo/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // Add Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "Nassayem Salalah",
    description: "Property Management in Salalah, Oman",
    images: ["/images/logo/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dm.className}>
      <head>
        {/* Add viewport meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Add canonical URL */}
        <link rel="canonical" href="https://nassayem.com" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
