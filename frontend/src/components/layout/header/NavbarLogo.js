
// "use client";

// import Link from "next/link";

// const NavbarLogo = () => {
//   return (
//     <div className="lg:col-start-1 lg:col-span-2 flex items-center">
//       <Link href="/" className="flex items-center">
//         <span className="text-xl md:text-2xl font-bold tracking-tight text-blackColor dark:text-whiteColor">
//           Just<span className="text-primaryColor">Click</span>
//         </span>
//       </Link>
//     </div>
//   );
// };

// export default NavbarLogo;
// src/components/layout/header/NavbarLogo.jsx
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