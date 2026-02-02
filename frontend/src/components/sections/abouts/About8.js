import Image from "next/image";
import React from "react";
import aboutCourseImage3 from "@/assets/images/about/about_single_course_3.png";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import HeadingSecondary from "@/components/shared/headings/HeadingSecondary";
import Counter3 from "@/components/sections/sub-section/Counter3";
const About8 = () => {
  return (
    <section className="pt-100px pb-50px">
      <div className="py-10 md:py-10 2xl:py-50px 3xl:py-30 mx-10px md:mx-50px 3xl:mx-150px bg-darkdeep3 dark:bg-darkdeep3-dark shadow-container rounded-5">
        <div className="container">
          {/* about section  */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-30px">
            {/* about left */}
            <div
              className="relative z-0 mb-30px lg:mb-0 pb-0 md:pb-30px xl:pb-0 overflow-visible"
              data-aos="fade-up"
            >
              <TiltWrapper>
                <div className="tilt">
                  <Image
                    className="w-full"
                    src={aboutCourseImage3}
                    alt=""
                    placeholder="blur"
                  />
                </div>
              </TiltWrapper>
            </div>
            {/* about right */}
            <div data-aos="fade-up">
              <HeadingSecondary>
                Welcome to the Carrer{" "}
                <span className="relative after:w-full after:h-[7px] after:bg-secondaryColor z-0 after:absolute after:left-0 after:bottom-3 md:after:bottom-5 md:after:-z-1">
                  Development
                </span>{" "}
                Course.
              </HeadingSecondary>
              <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark mb-6 pl-3 border-l-2 border-primaryColor">
                25+Contrary to popular belief, Lorem Ipsum is not simply random
                text roots in a piece of classical Latin literature from 45 BC
              </p>
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
                    Lorem ipsum dolor sit amet consectetur.
                  </p>
                </li>
                <li className="flex items-center group">
                  <i className="icofont-check text-primaryColor mr-15px border border-primaryColor rounded-full"></i>
                  <p className="text-sm md:text-base text-blackColor dark:text-blackColor-dark">
                    Dolor sit amet consectetur adipisicing elit.
                  </p>
                </li>
              </ul>
              {/* about counter */}
              <Counter3 />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About8;
