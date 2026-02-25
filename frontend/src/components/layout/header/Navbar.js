
// "use client";
// import NavbarLogo from "./NavbarLogo";
// import NavbarRight from "./NavbarRight";
// import NavItems from "./NavItems";

// const Navbar = () => {
//   return (
//     <div className="transition-all duration-500 sticky top-0 z-medium bg-white/80 dark:bg-whiteColor-dark/80 backdrop-blur-md border-b border-borderColor dark:border-borderColor-dark">
//       <nav className="container mx-auto px-4 py-4">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-10">
//             <NavbarLogo />
//             <NavItems />
//           </div>
//           <NavbarRight />
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default Navbar;
// src/components/layout/header/Navbar.jsx
"use client";
import { useState, useEffect } from "react";
import NavbarLogo from "./NavbarLogo";
import NavbarRight from "./NavbarRight";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-3" 
        : "bg-transparent py-4"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <NavbarLogo />
          <NavbarRight isScrolled={isScrolled} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;