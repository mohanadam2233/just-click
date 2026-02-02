import Image from "next/image";
import React from "react";
import aboutCourseImage2 from "@/assets/images/about/about_single_course_2.png";
import aboutImage15 from "@/assets/images/about/about_15.png";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
const About9 = () => {
  return (
    <section className="py-50px md:py-70px lg:py-20 2xl:pt-0 2xl:pb-50px">
      <div className="py-10 md:py-10 2xl:py-50px 3xl:py-30 mx-10px md:mx-50px 3xl:mx-150px bg-darkdeep3 dark:bg-darkdeep3-dark shadow-container rounded-5">
        <div className="container">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-30px">
            {/* about left */}
            <div data-aos="fade-up">
              <TiltWrapper>
                <div className="tilt">
                  <Image
                    className="w-full rounded-lg2"
                    src={aboutCourseImage2}
                    alt=""
                    placeholder="blur"
                  />
                </div>
              </TiltWrapper>
            </div>
            {/* about right */}
            <div data-aos="fade-up" className="2xl:ml-65px">
              <HeadingPrimary>Projects you will made.</HeadingPrimary>
              <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark mb-5 mt-3 ">
                Meet my startup design agency Shape Rex Currently I am working
                at CodeNext as Product Designer.
              </p>
              <p className="flex items-center gap-x-4 text-lg text-blackColor dark:text-blackColor-dark mb-5 md:mb-5px lg:mb-6 mt-15px">
                <Image loading="lazy" src={aboutImage15} alt="about" />
                <span>
                  <b>10+ Years ExperienceIn</b> this game, Means Product
                  Designing
                </span>
              </p>
              <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark mb-15px">
                I love to work in User Experience & User Interface designing.
              </p>
              <ul className="space-y-5">
                <li className="flex items-center group">
                  <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                  <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                    eCommerce design, Creative.
                  </p>
                </li>
                <li className="flex items-center group">
                  <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                  <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                    Business, Corporate, Education.
                  </p>
                </li>
                <li className="flex items-center group">
                  <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                  <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                    Non-Profit, It & Tech, Hosting.
                  </p>
                </li>
              </ul>
              <div className="pt-30px md:pt-10px lg:pt-30px">
                <ButtonPrimary path="/about" arrow={true}>
                  About More
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About9;
