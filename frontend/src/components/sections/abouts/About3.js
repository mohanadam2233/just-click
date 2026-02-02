import Image from "next/image";
import React from "react";
import about12 from "@/assets/images/about/about_12.png";
import about13 from "@/assets/images/about/about_13.png";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import SectionNameSecondary from "@/components/shared/section-names/SectionNameSecondary";
import HeadingPrimaryXl from "@/components/shared/headings/HeadingPrimaryXl ";
const About3 = () => {
  return (
    <section>
      <div className="container">
        {/* about section   */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-30px pb-30px">
          {/* about left  */}
          <div
            className="mb-20 lg:mb-0 pb-0 md:pb-30px xl:pb-0 overflow-visible"
            data-aos="fade-up"
          >
            <TiltWrapper>
              <div className="tilt relative z-0">
                <Image
                  className="absolute left-0"
                  src={about12}
                  alt=""
                  placeholder="blur"
                />
                <Image
                  src={about13}
                  alt=""
                  className="w-full"
                  placeholder="blur"
                />
              </div>
            </TiltWrapper>
          </div>
          {/* about right  */}
          <div data-aos="fade-up">
            <SectionNameSecondary>EDUCATION SOLUTION</SectionNameSecondary>
            <HeadingPrimaryXl>
              Welcome to the Online Learning Center
            </HeadingPrimaryXl>
            <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark mb-6 pl-3 border-l-2 border-primaryColor">
              25+Contrary to popular belief, Lorem Ipsum is not simply random
              text roots in a piece of classical Latin literature from 45 BC
            </p>
            <ul className="space-y-5">
              <li className="flex items-center group">
                <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                  Explore a variety of fresh educational teach
                </p>
              </li>
              <li className="flex items-center group">
                <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                  Explore a variety of fresh educational teach
                </p>
              </li>
              <li className="flex items-center group">
                <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                  Explore a variety of fresh educational teach
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About3;
