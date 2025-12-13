// This is the ROOT layout - DO NOT add 'use client' here
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
};

// This layout MUST return <html> and <body>
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dm.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
