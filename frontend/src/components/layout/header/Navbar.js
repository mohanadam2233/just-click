
"use client";
import NavbarLogo from "./NavbarLogo";
import NavbarRight from "./NavbarRight";
import NavItems from "./NavItems";

const Navbar = () => {
  return (
    <div className="transition-all duration-500 sticky top-0 z-medium bg-white/80 dark:bg-whiteColor-dark/80 backdrop-blur-md border-b border-borderColor dark:border-borderColor-dark">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-10">
            <NavbarLogo />
            <NavItems />
          </div>
          <NavbarRight />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;