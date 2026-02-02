import AiImage from "@/components/shared/animaited-images/AiImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import HeroSlider4 from "@/components/shared/hero-banner/HeroSlider4";

const Hero10 = () => {
  return (
    <section data-aos="fade-up">
      {/* banner section  */}
      <div className="hero machine-learning bg-[url(../assets/images/herobanner/ai_1.jpg)] bg-cover relative z-0 overflow-hidden ">
        {/* animated icons  */}
        <div>
          <AiImage />
          <GlobImage />
        </div>

        {/* Swiper  */}
        <HeroSlider4 />
      </div>
    </section>
  );
};

export default Hero10;
