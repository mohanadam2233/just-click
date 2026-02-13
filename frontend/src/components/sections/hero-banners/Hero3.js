
import React from "react";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import Image from "next/image";
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
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-30px">
            {/* banner Left */}
            <div data-aos="fade-up">
              <HreoName>SMART CAMPUS PORTAL</HreoName>
              <HeadingXl>
                All Your Class Materials & <span className="text-secondaryColor">AI Tutor</span> in One Place.
              </HeadingXl>
              <p className="text-size-15 md:text-lg text-blackColor dark:text-blackColor-dark font-medium mb-45px leading-7">
                Stop scrolling through WhatsApp history. Access lecture slides, 
                past exams, and get instant answers from your AI study assistant—anytime, anywhere.
              </p>

              <div className="space-x-5 md:space-x-30px">
                <ButtonPrimary path="/login">
                    Get Started Now
                </ButtonPrimary>
                <ButtonPrimary color="secondary" path="/courses">
                  Browse Courses
                </ButtonPrimary>
              </div>
            </div>
            {/* banner right */}
            <div data-aos="fade-up">
              <TiltWrapper>
                <div className="tilt relative z-1">
                  <Image
                    className="w-full"
                    src={about10}
                    alt="Student using the portal"
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