"use client";

import BalbImage from "@/components/shared/animaited-images/BalbImage";

import GlobImage from "@/components/shared/animaited-images/GlobImage";
import TriangleImage from "@/components/shared/animaited-images/TriangleImage";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-black/5 bg-lightGrey10 dark:bg-lightGrey10-dark dark:border-white/10">
      {/* animated shapes */}
      <div className="pointer-events-none">
        <GlobImage type={"secondary"} />
        <BalbImage type={"secondary"} />
        <TriangleImage type={"secondary"} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 py-14 md:flex-row md:items-center md:justify-between md:gap-14 md:py-16 lg:py-20">
          {/* left */}
          <div className="flex min-w-0 flex-1 items-center">
            <Link
              href="/materials"
              className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor"
            >
              <span className="text-[30px] md:text-[34px] font-extrabold tracking-[-0.03em] text-blackColor2 dark:text-blackColor2-dark transition-opacity hover:opacity-80">
                Just<span className="text-primaryColor">Click</span>
              </span>
            </Link>
          </div>

          {/* center */}
          <div className="flex flex-wrap items-center justify-start gap-x-10 gap-y-3 md:flex-1 md:justify-center lg:gap-x-12">
            <Link
              href="/privacy"
              className="text-[15px] md:text-base font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover:text-primaryColor transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[15px] md:text-base font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover:text-primaryColor transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-[15px] md:text-base font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover:text-primaryColor transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* right */}
          <div className="flex min-w-0 flex-1 items-center md:justify-end">
            <p className="text-[15px] md:text-base font-medium text-contentColor dark:text-contentColor-dark">
              © {currentYear} JustClick
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
