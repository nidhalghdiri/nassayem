import "@/public/css/bootstrap.min.css";
import "@/public/fonts/font-icons.css";
import "@/public/fonts/fonts.css";
import "@/public/css/swiper-bundle.min.css";
import "@/public/css/animate.css";
import "@/public/css/styles.css";
import "@/public/css/dashboard.css";
import { DM_Sans } from "next/font/google";
import AuthProvider from "./providers/SessionProvider";

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
    <html lang="en" className={dm.className} suppressHydrationWarning>
      <head>
        {/* Add viewport meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Add canonical URL */}
        <link rel="canonical" href="https://nassayem.com" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
