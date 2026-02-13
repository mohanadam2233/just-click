// "use client";
// import FooterNavList from "./FooterNavList";
// import CopyRight from "./CopyRight";
// import FooterTop from "./FooterTop";
// import { usePathname } from "next/navigation";

// const Footer = () => {
//   const pathname = usePathname();
//   const isHome8 = pathname === "/home-8" || pathname === "/home-8-dark";
//   const isHome9 = pathname === "/home-9" || pathname === "/home-9-dark";
//   const isHome10 = pathname === "/home-10" || pathname === "/home-10-dark";
//   return (
//     <footer
//       className={`${
//         isHome9
//           ? "2xl:bg-[url(../assets/images/footer/footer_bg.png)]"
//           : isHome10
//           ? "2xl:bg-[url(../assets/images/footer/footer_bg_ai.png)] "
//           : ""
//       } bg-darkblack 2xl:bg-cover`}
//     >
//       <div
//         className={`${
//           isHome8 ? "container-fluid-2" : "container"
//         }   pt-65px pb-5 lg:pb-10  `}
//       >
//         {/* footer top or subscription */}
//         {/* <FooterTop /> */}
//         {/* footer main */}
//         <FooterNavList />

//         {/* footer copyright  */}
//         <CopyRight />
//       </div>
//     </footer>
//   );
// };

// export default Footer;
// components/layout/footer/Footer.jsx
"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/logo/logo_1.png"; // adjust path if needed

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src={logo}
              alt="CMCP Logo"
              width={140}
              height={48}
              className="h-auto w-auto"
              priority={false}
            />
          </Link>

          {/* Copyright */}
          <p className="text-sm text-gray-600 dark:text-gray-400 order-3 md:order-2">
            &copy; {currentYear} CMCP. All rights reserved.
          </p>

          {/* Privacy & Terms Links */}
          <div className="flex items-center gap-4 text-sm order-2 md:order-3">
            <Link
              href="/privacy"
              className="text-gray-600 dark:text-gray-400 hover:text-primaryColor dark:hover:text-primaryColor transition-colors"
            >
              Privacy
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link
              href="/terms"
              className="text-gray-600 dark:text-gray-400 hover:text-primaryColor dark:hover:text-primaryColor transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>

        {/* Optional small note or extra spacing */}
        <div className="text-center mt-6 text-xs text-gray-400 dark:text-gray-600">
          Centralized Class Materials Portal – IT Department
        </div>
      </div>
    </footer>
  );
};

export default Footer;