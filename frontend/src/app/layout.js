
import { Hind, Inter } from "next/font/google";
import "@/assets/css/icofont.min.css";
import "@/assets/css/popup.css";
import "@/assets/css/video-modal.css";
import "aos/dist/aos.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-cards";
import "./globals.css";
import AppEffects from "@/components/shared/AppEffects";
import FixedShadow from "@/components/shared/others/FixedShadow";
import PreloaderPrimary from "@/components/shared/others/PreloaderPrimary";

import ReactQueryProvider from "@/providers/ReactQueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import CartContextProvider from "@/contexts/CartContext";
import WishlistContextProvider from "@/contexts/WshlistContext";
export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const hind = Hind({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind",
});

export const metadata = {
  title: "CMCP",
  description: "CMCP system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${hind.variable}`}>
      <body className={`relative leading-[1.8] bg-bodyBg dark:bg-bodyBg-dark z-0 ${inter.className}`}>
             <ReactQueryProvider>
          <SessionProvider>
            <CartContextProvider>
              <WishlistContextProvider>
                 <AppEffects />  
                <PreloaderPrimary />
                {children}
                <div>
                  <FixedShadow />
                  <FixedShadow align={"right"} />
                </div>
              </WishlistContextProvider>
            </CartContextProvider>
          </SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}