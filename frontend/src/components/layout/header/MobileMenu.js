"use client";
import MobileMenuClose from "@/components/shared/buttons/MobileMenuClose";
import MobileMenuSimple from "./MobileMenuSimple";

const MobileMenu = () => {
  return (
    <div
      id="mobile-menu"
      className="
        mobile-menu
        fixed top-0 right-0 h-full
        w-[280px] md:w-[330px]
        bg-white dark:bg-gray-900
        shadow-dropdown-secodary
        z-high
        transform translate-x-full
        transition-transform duration-500
        lg:hidden
      "
    >
      <MobileMenuClose />

      <div className="px-5 md:px-30px pt-5 md:pt-10 pb-50px h-full overflow-y-auto">
        <MobileMenuSimple />
      </div>
    </div>
  );
};

export default MobileMenu;