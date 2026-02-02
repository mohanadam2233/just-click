import React from "react";
import About1 from "./About1";
import aboutImage17 from "@/assets/images/about/about_17.png";
const About4 = () => {
  return (
    <About1 image={aboutImage17} hideCounter={true}>
      Welcome to another best{" "}
      <span className="relative after:w-full after:h-[7px] z-0 after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 after:-z-1 md:after:bottom-5">
        University
      </span>{" "}
      in the world.
    </About1>
  );
};

export default About4;
