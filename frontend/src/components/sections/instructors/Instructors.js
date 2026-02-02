import Image from "next/image";
import React from "react";
import aboutImage5 from "@/assets/images/about/about_5.png";
import aboutImage6 from "@/assets/images/about/about_6.png";
import aboutImage7 from "@/assets/images/about/about_7.png";
import aboutImage9 from "@/assets/images/about/about_9.png";
import SectionName from "@/components/shared/section-names/SectionName";
import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
const Instructors = () => {
  const instructors = [
    {
      name: "Robind Jon",
      desig: "Desginer TechBoot",
      image: aboutImage5,
      desc: "“The other hand we denounce righteou indg ation men who are so beguiled and demoraliz by the the mo ment.Dislike men who so development co”",
    },
    {
      name: "Robind Jon",
      desig: "Desginer TechBoot",
      image: aboutImage5,
      desc: "“The other hand we denounce righteou indg ation men who are so beguiled and demoraliz by the the mo ment.Dislike men who so development co”",
    },
  ];
  return (
    <section className="bg-lightGrey10 dark:dark:bg-lightGrey10-dark relative">
      <div>
        <Image
          src={aboutImage6}
          alt=""
          className="absolute top-[110px] left-[216px] animate-move-hor z-1"
        />
        <Image
          src={aboutImage7}
          alt=""
          className="absolute top-[320px] left-[162px] md:left-[262px] lg:left-[318px] 2xl:left-[162px] animate-spin-slow z-1"
        />
        <Image
          src={aboutImage9}
          alt=""
          className="absolute top-[430px] left-[156px] md:top-[630px] md:left-[476px] lg:top-[433px] lg:left-[196px] 2xl:top-[400px] 2xl:left-[156px] animate-move-var z-1"
        />
      </div>
      <div className="container pt-20 pb-20 2xl:pt-30 2xl:pb-90px">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-15">
          <div
            className="lg:col-start-1 lg:col-span-1 md:col-start-1 md:col-span-2"
            data-aos="fade-up"
          >
            <div className="relative">
              <SectionName>Course List</SectionName>
              <HeadingPrimary>What They Say About us</HeadingPrimary>
              <p className="text-sm md:text-base text-contentColor mt-5 mb-5 2xl:mb-45px dark:text-contentColor-dark">
                Construction is a general term meaning the art and science to
                form systems organizations and comes from Latin Construction is
              </p>

              <div>
                <ButtonPrimary path="#" color="secondary" arrow={true} href="#">
                  Explore More
                </ButtonPrimary>
              </div>
            </div>
          </div>

          {instructors.map(({ name, image, desc, desig, id }, idx) => (
            <div key={idx} data-aos="fade-up">
              <div className="bg-whiteColor px-25px py-50px mb-22px relative dark:bg-whiteColor-dark">
                <p className="text-base lg:text-sm 2xl:text-base text-contentColor dark:text-contentColor-dark">
                  {desc}
                </p>

                <div className="text-xl lg:text-3xl text-whiteColor bg-primaryColor w-10 h-10 lg:w-15 lg:h-15 flex items-center justify-center absolute top-0 left-0 md:-translate-y-1/2 md:-translate-x-1/2 z-20">
                  <i className="icofont-quote-left"></i>
                </div>
                <span className="w-0 h-0 border-l-12 border-r-12 border-t-15 border-l-transparent border-r-transparent border-t-whiteColor absolute bottom-[-14px] left-[27px] dark:border-t-whiteColor-dark"></span>
              </div>

              <div className="flex items-center gap-5 2xl:gap-20">
                <div>
                  <Image
                    src={image}
                    alt=""
                    className="w-20 h-20 rounded-full"
                    placeholder="blur"
                  />
                </div>
                <div>
                  <h4 className="text-xl lg:text-lg 2xl:text-xl font-semibold text-blackColor dark:text-blackColor-dark">
                    {name}
                  </h4>
                  <p className="text-base lg:text-size-15 2xl:text-base text-lightGrey9 dark:text-lightGrey9-dark">
                    {desig}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instructors;
