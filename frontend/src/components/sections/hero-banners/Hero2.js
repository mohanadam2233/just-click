import Image from "next/image";
import shapeImage2 from "@/assets/images/education/hero_shape2.png";
import shapeImage3 from "@/assets/images/education/hero_shape3.png";
import shapeImage4 from "@/assets/images/education/hero_shape4.png";
import shapeImage5 from "@/assets/images/education/hero_shape5.png";
import educationImage from "@/assets/images/education/education.png";
import educationImage1 from "@/assets/images/education/education__1.png";
import educationImage2 from "@/assets/images/education/education__2.png";
import educationImage3 from "@/assets/images/education/education__3.png";
import educationImage4 from "@/assets/images/education/education__4.png";
import educationImage5 from "@/assets/images/education/education__5.png";
import educationImage6 from "@/assets/images/education/education__6.png";
import educationImage7 from "@/assets/images/education/education__7.png";
import aboutImage16 from "@/assets/images/about/about_16.png";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
const {
  default: HeadingLg,
} = require("@/components/shared/headings/HeadingLg");
const {
  default: SectionName,
} = require("@/components/shared/section-names/SectionName");
const { default: Link } = require("next/link");

const Hero2 = () => {
  return (
    <section data-aos="fade-up">
      <div className="overflow-hidden relative z-0">
        {/* animated icons */}
        <div>
          <Image
            src={shapeImage2}
            className="absolute right-[16%] top-[60%] md:right-[31px] md:top-[70%] lg:right-[16%] lg:top-[60%] animate-move-var z-10"
            alt=""
          />
          <Image
            src={shapeImage3}
            className="absolute right-[9%] top-[58%] md:right-[12%] lg:right-[9%] animate-move-hor z-10"
            alt=""
          />
          <Image
            src={shapeImage4}
            className="absolute left-1/2 bottom-[15%] md:left-[4%] lg:left-1/2 animate-spin-slow"
            alt=""
          />
          <Image
            src={shapeImage5}
            className="absolute left-[53%] top-[41%] md:left-[9%] md:top-[43%] lg:left-[53%] animate-spin-slow"
            alt=""
          />
        </div>
        <div className="container pt-12 lg:pt-130px pb-175px relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 md:gap-15 lg:gap-30px">
            {/* banner Left */}
            <div className="lg:col-start-1 lg:col-span-7" data-aos="fade-up">
              <SectionName>Education</SectionName>
              <HeadingLg>
                Cloud-based LMS <br className="hidden lg:block" />
                Trusted by 1000+
              </HeadingLg>
              <p className="text-size-15 lg:text-base 2xl:text-lg text-contentColor mb-5 2xl:mb-30px dark:text-contentColor-dark">
                Lorem Ipsum is simply dummy text of the printing
                <br className="hidden 2xl:block" />
                typesetting industry. Lorem Ipsum has been
              </p>

              <div>
                <form className="flex gap-x-15px items-center flex-wrap gap-y-5">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="basis-[311px] h-14 leading-14 pl-3 border border-contentColor text-blackColor focus:outline-none rounded"
                  />
                  <button
                    type="submit"
                    className="text-size-15 text-whiteColor bg-primaryColor px-39px py-14px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
                  >
                    Sign Up
                  </button>
                </form>
              </div>
            </div>
            {/* banner right */}
            <div className="lg:col-start-8 lg:col-span-5" data-aos="fade-up">
              <TiltWrapper>
                <div className="tilt relative z-0">
                  {/* bannar image */}
                  <div className="flex flex-col items-center lg:items-end">
                    <Image
                      className="text-center"
                      src={educationImage}
                      alt=""
                      placeholder="blur"
                    />
                    <Image
                      className="absolute left-0 bottom-[-93px] md:left-[30px] lg:left-0"
                      src={educationImage1}
                      alt=""
                      placeholder="blur"
                    />
                    <Image
                      src={educationImage2}
                      className="absolute left-5 top-10 md:left-[30px] lg:left-5 -z-10"
                      alt=""
                      placeholder="blur"
                    />
                    <Image
                      src={educationImage3}
                      className="absolute -right-4 top-[-22px] md:right-[155px] lg:-right-4 z-[-1] animate-move-hor"
                      alt=""
                      placeholder="blur"
                    />
                  </div>
                  <div className="w-300px md:w-342px absolute top-6 rihgt-0 md:top-[41px] md:right-[9px] lg:right-[-26px] 2xl:right-[-166px] bg-whiteColor p-10px flex gap-x-5 items-center animate-move-var shadow-hero-greeting dark:bg-whiteColor-dark">
                    <div>
                      <Image
                        src={aboutImage16}
                        className="w-55px h-55px rounded block"
                        alt=""
                        placeholder="blur"
                      />
                    </div>
                    <div>
                      <p className="text-size-15 font-semibold text-greencolor3">
                        Congratulations!!
                      </p>
                      <p className="text-sm text-contentColor dark:text-contentColor-dark">
                        Your Admission Completed
                      </p>
                    </div>
                  </div>
                  <div className="absolute right-10 bottom-[-136px] md:right-[219px] md:bottom-[-105px] lg:right-[-50px] lg:bottom-[-125px] 2xl:right-10 2xl:bottom-[-105px]">
                    <Link href="#" className="flex group">
                      <Image
                        src={educationImage4}
                        className="w-52px h-52px"
                        alt=""
                        placeholder="blur"
                      />
                      <Image
                        src={educationImage5}
                        className="w-52px h-52px transition-all duration-300 -ml-35px group-hover:-ml-30px"
                        alt=""
                        placeholder="blur"
                      />
                      <Image
                        src={educationImage6}
                        className="w-52px h-52px transition-all duration-300 -ml-35px group-hover:-ml-30px"
                        alt=""
                        placeholder="blur"
                      />
                      <Image
                        src={educationImage7}
                        className="w-52px h-52px transition-all duration-300 -ml-35px group-hover:-ml-30px"
                        alt=""
                        placeholder="blur"
                      />
                    </Link>
                    <div>
                      <p className="text-sm text-lightGrey3 mb-15px">
                        Join over
                        <span className="text-blackColor dark:text-blackColor-dark">
                          4000+
                        </span>
                        students
                      </p>
                    </div>
                  </div>
                </div>
              </TiltWrapper>
            </div>
          </div>
        </div>
      </div>
      {/* bannaer section */}
    </section>
  );
};

export default Hero2;
