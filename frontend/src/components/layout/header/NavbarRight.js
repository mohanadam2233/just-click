"use client";
import Link from "next/link";
import MobileMenuOpen from "@/components/shared/buttons/MobileMenuOpen";

const NavbarRight = ({ isScrolled }) => {
  const loginClass = isScrolled
    ? "text-gray-700 dark:text-gray-200 hover:text-primaryColor"
    : "text-blackColor/80 dark:text-whiteColor/80 hover:text-blackColor dark:hover:text-whiteColor";

  const btnClass = isScrolled
    ? "bg-primaryColor text-white hover:shadow-lg hover:shadow-primaryColor/25"
    : "bg-primaryColor text-white hover:shadow-lg hover:shadow-primaryColor/25";

  return (
    <div className="flex items-center gap-4">
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-3">
        <Link href="/login" className={`text-sm font-semibold transition-colors ${loginClass}`}>
          Log in
        </Link>

        <Link
          href="/register"
          className={`text-sm font-bold px-5 py-2 rounded-full transition-all ${btnClass}`}
        >
          Get started →
        </Link>
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <MobileMenuOpen />
      </div>
    </div>
  );
};

export default NavbarRight;