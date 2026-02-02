import Image from "next/image";
import aboutImage from "@/assets/images/about/about_ai.jpg";
import aboutImage15 from "@/assets/images/about/about_15.png";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import SectionName from "@/components/shared/section-names/SectionName";

import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
const About6 = () => {
  return (
    <section>
      <div className="container py-50px md:py-70px lg:py-20 2xl:py-100px">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-30px">
          {/* about left */}
          <div data-aos="fade-up">
            <TiltWrapper>
              <div className="tilt">
                <Image
                  className="w-full rounded-lg2"
                  src={aboutImage}
                  alt=""
                  placeholder="blur"
                />
              </div>
            </TiltWrapper>
          </div>
          {/* about right */}
          <div data-aos="fade-up" className="2xl:ml-65px">
            <SectionName>About Us</SectionName>
            <HeadingPrimary>
              Welcome to the online Learning Center
            </HeadingPrimary>
            <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark mb-25px">
              Meet my startup design agency Shape Rex Currently I am working at
              CodeNext as Product Designer.
            </p>
            <p className="flex items-center gap-x-4 text-lg text-blackColor dark:text-blackColor-dark mb-25px">
              <Image loading="lazy" src={aboutImage15} alt="about" />
              <span>
                <b>10+ Years ExperienceIn</b> this game, Means Product Designing
              </span>
            </p>
            <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark">
              I love to work in User Experience & User Interface designing.
              Because I love to solve the design problem and find easy and
              better solutions to solve it.
            </p>

            <div className="mt-30px">
              <ButtonPrimary path="/about" arrow={true}>
                About More
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About6;
