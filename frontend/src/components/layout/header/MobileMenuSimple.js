// components/layout/mobile-menu/MobileMenuSimple.jsx
import Link from "next/link";
import React from "react";

const MobileMenuSimple = () => {
  const navItems = [
    { name: "Overview", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "About", path: "/about" },
  ];

  return (
    <div className="flex flex-col space-y-6">
      {/* Navigation Links */}
      <nav className="flex flex-col space-y-4 border-b border-borderColor dark:border-borderColor-dark pb-6">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.path}
            className="text-lg font-medium text-blackColor dark:text-whiteColor hover:text-primaryColor transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Login & Signup Buttons */}
      <div className="flex flex-col space-y-3">
        <Link
          href="/login"
          className="text-center py-3 px-4 border border-primaryColor text-primaryColor font-semibold rounded-lg hover:bg-primaryColor/5 transition"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="text-center py-3 px-4 bg-primaryColor text-white font-semibold rounded-lg hover:bg-primaryColor/90 transition shadow-md"
        >
          Get Started
        </Link>
      </div>

      {/* Optional: Small note or copyright (can be removed) */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4">
        CMCP – IT Department Portal
      </p>
    </div>
  );
};

export default MobileMenuSimple;