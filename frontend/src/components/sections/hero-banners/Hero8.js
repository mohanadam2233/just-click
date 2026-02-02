import AppleImage from "@/components/shared/animaited-images/AppleImage";
import BalbImage from "@/components/shared/animaited-images/BalbImage";
import BookImage from "@/components/shared/animaited-images/BookImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import TriangleImage from "@/components/shared/animaited-images/TriangleImage";
import HeroSlider3 from "@/components/shared/hero-banner/HeroSlider3";

const Hero8 = () => {
  return (
    <section data-aos="fade-up">
      {/* banner section */}
      <div className="hero bg-lightGrey11 dark:bg-lightGrey11-dark relative z-0 overflow-hidden  ">
        {/* animated icons */}
        <div>
          <BookImage />
          <GlobImage />
          <BalbImage />
          <AppleImage />
          <TriangleImage />
        </div>

        {/* Swiper */}
        <HeroSlider3 />
      </div>
    </section>
  );
};

export default Hero8;
