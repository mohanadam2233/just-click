const {
  default: TiltWrapper,
} = require("@/components/shared/wrappers/TiltWrapper");
const { default: Image } = require("next/image");
import about10 from "@/assets/images/about/about_10.png";
import AppleImage from "@/components/shared/animaited-images/AppleImage";
import BalbImage from "@/components/shared/animaited-images/BalbImage";
import BookImage from "@/components/shared/animaited-images/BookImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import TriangleImage from "@/components/shared/animaited-images/TriangleImage";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import HeadingXl from "@/components/shared/headings/HeadingXl";
import HreoName from "@/components/shared/section-names/HreoName";
const Hero3 = () => {
  return (
    <section data-aos="fade-up">
      {/* banner section */}
      <div className="bg-lightGrey11 dark:bg-lightGrey11-dark relative z-0 overflow-hidden py-50px md:py-100px lg:pt-100px lg:pb-150px 2xl:pt-155px 2xl:pb-250px">
        {/* animated icons */}
        <div>
          <BookImage />
          <GlobImage />
          <BalbImage />
          <AppleImage />
          <TriangleImage />
        </div>
        <div className="container 2xl:container-secondary-md relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* banner Left */}
            <div data-aos="fade-up">
              <HreoName>EDUCATION SOLUTION</HreoName>
              <HeadingXl>
                Centralized IT Materials Platform with AI Study Assistant
              </HeadingXl>
              <p className="text-size-15 md:text-lg text-blackColor dark:text-blackColor-dark font-medium mb-45px">
                A unified system for managing IT course materials,
                <br />
                enhanced with a curriculum-grounded AI assistant.
              </p>

              <div className="space-x-5 md:space-x-30px">
                <ButtonPrimary path="/courses">Access Materials</ButtonPrimary>
                <ButtonPrimary color="secondary" path="/courses">
                  Explore More
                </ButtonPrimary>
              </div>
            </div>
            {/* banner right */}
            <div data-aos="fade-up">
              <TiltWrapper>
                <div className="tilt">
                  <Image
                    className="w-full"
                    src={about10}
                    alt=""
                    placeholder="blur"
                  />
                </div>
              </TiltWrapper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero3;
