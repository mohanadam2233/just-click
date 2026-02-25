"use client";

import { useEffect } from "react";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";

import Aos from "aos";
import stickyHeader from "@/libs/stickyHeader";
import smoothScroll from "@/libs/smoothScroll";

export default function PublicHeader() {
  useEffect(() => {
    stickyHeader();
    smoothScroll();

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
}