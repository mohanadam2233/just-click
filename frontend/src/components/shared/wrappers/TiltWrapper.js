"use client";

import Aos from "aos";
import { useEffect } from "react";
import VanillaTilt from "vanilla-tilt";

const TiltWrapper = ({ children }) => {
  useEffect(() => {
    //hover effect parallex
    VanillaTilt.init(document.querySelectorAll(".tilt"), {
      perspective: 2000,
    });
  }, []);
  return children;
};

export default TiltWrapper;
