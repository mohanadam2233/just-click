"use client";
import Aos from "aos";
import { useEffect } from "react";
import MobileMenu from "./MobileMenu";
import Navbar from "./Navbar";

const Header = () => {
  useEffect(() => {
    Aos.init({
      offset: 1,
      duration: 1000,
      once: true,
      easing: "ease",
    });
  }, []);

  return (
    <header>
      <Navbar />
      <MobileMenu />
    </header>
  );
};

export default Header;
