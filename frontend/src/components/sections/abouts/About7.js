import Image from "next/image";
import React from "react";
import aboutCourse1 from "@/assets/images/about/about_single_course_1.jpg";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import SectionName from "@/components/shared/section-names/SectionName";
import HeadingPrimaryXl from "@/components/shared/headings/HeadingPrimaryXl ";
import HeadingSecondary from "@/components/shared/headings/HeadingSecondary";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
const About7 = () => {
  return (
    <section>
      <div className="container">
        {/* about section  */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-30px pt-50px">
          {/* about left */}
          <div
            data-aos="fade-up"
            className="lg:col-start-1 lg:col-span-5 xl:col-span-4"
          >
            <TiltWrapper>
              <div className="tilt relative">
                <Image
                  className="w-full"
                  src={aboutCourse1}
                  alt=""
                  placeholder="blur"
                />
              </div>
            </TiltWrapper>
          </div>

          {/* about right */}
          <div
            data-aos="fade-up"
            className="lg:col-start-6 lg:col-span-7 xl:col-start-5 xl:col-span-8 lg:pl-35px"
          >
            <SectionName>Learn About</SectionName>

            <HeadingSecondary>
              What {"You'll"}{" "}
              <span className="relative after:w-full after:h-[7px] after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5">
                Discover
              </span>
            </HeadingSecondary>
            <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark mb-6 md:mb-8">
              Forging relationships between multi to national Governments and
              global. Explore a variety of fresh educational teach. National
              Governments and global.
            </p>
            <h5 className="text-xl md:text-2xl font-bold text-blackColor dark:text-blackColor-dark mb-15px">
              Whats Material Includes?
            </h5>
            <ul className="space-y-5">
              <li className="flex items-center group">
                <i className="icofont-check text-primaryColor mr-15px border border-primaryColor rounded-full"></i>
                <p className="text-sm md:text-base text-blackColor dark:text-blackColor-dark">
                  Explore a variety of fresh educational teach
                </p>
              </li>
              <li className="flex items-center group">
                <i className="icofont-check text-primaryColor mr-15px border border-primaryColor rounded-full"></i>
                <p className="text-sm md:text-base text-blackColor dark:text-blackColor-dark">
                  Lorem ipsum dolor sit amet consectetur nidedsd.
                </p>
              </li>
              <li className="flex items-center group">
                <i className="icofont-check text-primaryColor mr-15px border border-primaryColor rounded-full"></i>
                <p className="text-sm md:text-base text-blackColor dark:text-blackColor-dark">
                  Dolor sit amet consectetur adipisicing elit bnide.
                </p>
              </li>
            </ul>

            <div className="mt-10">
              <ButtonPrimary path="/about" arrow={true}>
                Learn More About
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About7;
