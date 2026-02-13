
"use client";
import Link from "next/link";
import MobileMenuOpen from "@/components/shared/buttons/MobileMenuOpen";

const NavbarRight = () => {
  return (
    <div className="flex items-center gap-4">
      <ul className="flex items-center gap-x-2 md:gap-x-4">
     
        <li className="hidden sm:block">
          <Link
            href="/login" // Links to the signup tab
            className="text-sm font-bold text-white bg-primaryColor px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-primaryColor/30 transition-all border border-primaryColor"
          >
            Get Started
          </Link>
        </li>
        <li className="lg:hidden">
          <MobileMenuOpen />
        </li>
      </ul>
    </div>
  );
};

export default NavbarRight;