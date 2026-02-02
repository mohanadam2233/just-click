import AppleImage from "@/components/shared/animaited-images/AppleImage";
import BalbImage from "@/components/shared/animaited-images/BalbImage";
import BookImage from "@/components/shared/animaited-images/BookImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import TriangleImage from "@/components/shared/animaited-images/TriangleImage";
import HeroSlider2 from "@/components/shared/hero-banner/HeroSlider2";
import React from "react";

const Hero7 = () => {
  return (
    <section data-aos="fade-up" className="hero relative z-0 overflow-hidden">
      {/* banner section  */}
      <div>
        {/* animated icons  */}
        <div>
          <BookImage />
          <GlobImage />
          <BalbImage />
          <AppleImage />
          <TriangleImage />
        </div>

        {/* Swiper  */}
        <HeroSlider2 />
      </div>
    </section>
  );
};

export default Hero7;
