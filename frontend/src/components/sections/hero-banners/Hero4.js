import AppleImage from "@/components/shared/animaited-images/AppleImage";
import BalbImage from "@/components/shared/animaited-images/BalbImage";
import BookImage from "@/components/shared/animaited-images/BookImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import TriangleImage from "@/components/shared/animaited-images/TriangleImage";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import HeadingXl from "@/components/shared/headings/HeadingXl";
import HeroSlider from "@/components/shared/hero-banner/HeroSlider";
import SectionNameSecondary from "@/components/shared/section-names/SectionNameSecondary";

const Hero4 = () => {
  return (
    <section data-aos="fade-up">
      {/* banner section */}
      <div className="hero bg-lightGrey11 dark:bg-lightGrey11-dark relative z-0 overflow-hidden py-50px md:pt-70px md:pb-30">
        {/* animated icons */}
        <div>
          <BookImage />
          <GlobImage />
          <BalbImage />
          <AppleImage />
          <TriangleImage />
        </div>

        <div className="container 2xl:container-secondary-md relative">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-30px">
            {/* banner Left */}
            <div
              data-aos="fade-up"
              className="md:col-start-1 md:col-span-12 lg:col-start-1 lg:col-span-8"
            >
              <div className="3xl:pr-135px">
                <SectionNameSecondary>EDUCATION SOLUTION</SectionNameSecondary>
                <HeadingXl>
                  Ignite Your{" "}
                  <span className="text-secondaryColor">Career</span> with
                  Learning the Largest{" "}
                  <span className="text-secondaryColor">Online</span> Platform.
                </HeadingXl>
                <p className="text-size-15 md:text-lg text-blackColor dark:text-blackColor-dark font-medium">
                  Lorem Ipsum is simply dummy text of the printing
                  <br />
                  typesetting industry. Lorem Ipsum has been
                </p>

                <div className="mt-30px space-x-30px">
                  <ButtonPrimary path="/courses">View Courses</ButtonPrimary>
                  <ButtonPrimary color="secondary" path="/courses">
                    Explore More
                  </ButtonPrimary>
                </div>
              </div>
            </div>
            {/* banner right */}
            <div
              data-aos="fade-up"
              className="md:col-start-1 md:col-span-8 lg:col-start-9 lg:col-span-4"
            >
              {/* Swiper */}
              <HeroSlider />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero4;
