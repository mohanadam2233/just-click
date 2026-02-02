"use client";

import mobileMenu from "@/libs/mobileMenu";
import { useEffect } from "react";

const MobileMenuOpen = () => {
  useEffect(() => {
    mobileMenu();
  }, []);
  return (
    <button className="open-mobile-menu text-3xl text-darkdeep1 hover:text-secondaryColor dark:text-whiteColor dark:hover:text-secondaryColor">
      <i className="icofont-navigation-menu"></i>
    </button>
  );
};

export default MobileMenuOpen;
