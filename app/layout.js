import "@/public/css/bootstrap.min.css";
import "@/public/fonts/font-icons.css";
import "@/public/fonts/fonts.css";
import "@/public/css/swiper-bundle.min.css";
import "@/public/css/animate.css";
import "@/public/css/styles.css";
import "@/public/css/dashboard.css";
import { DM_Sans } from "next/font/google";
import AuthProvider from "./providers/SessionProvider";

export default function RootLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
