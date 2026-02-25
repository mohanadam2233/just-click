"use client";

import { useEffect } from "react";
import Aos from "aos";
import stickyHeader from "@/libs/stickyHeader";
import smoothScroll from "@/libs/smoothScroll";

export default function AppEffects() {
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

  return null;
}