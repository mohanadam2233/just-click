
// import Image from "next/image";
// import React from "react";
// import logo1 from "@/assets/images/logo/logo_1.png";
// import Link from "next/link";

// const NavbarLogo = () => {
//   return (
//     <div className="lg:col-start-1 lg:col-span-2">
//       <Link href="/" className="w-logo-sm lg:w-logo-lg">
//         <Image priority="false" src={logo1} alt="CMCP Logo" className="w-full py-2" />
//       </Link>
//     </div>
//   );
// };

// export default NavbarLogo;
"use client";

import Link from "next/link";

const NavbarLogo = () => {
  return (
    <div className="lg:col-start-1 lg:col-span-2 flex items-center">
      <Link href="/" className="flex items-center">
        <span className="text-xl md:text-2xl font-bold tracking-tight text-blackColor dark:text-whiteColor">
          Just<span className="text-primaryColor">Click</span>
        </span>
      </Link>
    </div>
  );
};

export default NavbarLogo;