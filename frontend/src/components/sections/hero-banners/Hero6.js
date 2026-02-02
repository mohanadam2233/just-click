import HeadingLg from "@/components/shared/headings/HeadingLg";
import HreoName from "@/components/shared/section-names/HreoName";
import Image from "next/image";
import React from "react";

import herobannerImage6 from "@/assets/images/herobanner/herobanner__6.png";
import herobannerImage7 from "@/assets/images/herobanner/herobanner__7.png";
import registerImage2 from "@/assets/images/register/register__2.png";
const Hero6 = () => {
  return (
    <section data-aos="fade-up">
      {/* bannaer section */}
      <div className="container2-xl bg-darkdeep1 py-50px md:pt-20 md:pb-30 2xl:pt-130px 2xl:pb-50 rounded-2xl relative overflow-hidden shadow-brand">
        <div className="container">
          <div className="flex flex-col items-center text-center w-full lg:w-83% xl:w-3/4 mx-auto">
            {/* banner Left */}
            <div data-aos="fade-up" className="w-4/5 mb-15px">
              <HreoName>EDUCATION SOLUTION</HreoName>
              <HeadingLg color="white">
                Massive Courses <br />
                Available for Anyone{" "}
                <span className="text-secondaryColor">.</span>
              </HeadingLg>
            </div>
            <form
              data-aos="fade-up"
              className="bg-whiteColor w-full rounded-full py-1 sm:py-6px pl-30px pr-1 sm:pr-2 flex items-center justify relative z-small"
            >
              <div className="flex items-center text-blackColor text-base">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ionicon w-3 md:w-4 mr-0.5 md:mr-1 mt-0.5 sm:mt-0"
                    viewBox="0 0 512 512"
                  >
                    <rect
                      x="48"
                      y="48"
                      width="176"
                      height="176"
                      rx="20"
                      ry="20"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="32"
                    ></rect>
                    <rect
                      x="288"
                      y="48"
                      width="176"
                      height="176"
                      rx="20"
                      ry="20"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="32"
                    ></rect>
                    <rect
                      x="48"
                      y="288"
                      width="176"
                      height="176"
                      rx="20"
                      ry="20"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="32"
                    ></rect>
                    <rect
                      x="288"
                      y="288"
                      width="176"
                      height="176"
                      rx="20"
                      ry="20"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="32"
                    ></rect>
                  </svg>
                </div>
                <div>
                  <select className="w-16 sm:w-20 md:w-28 cursor-pointer text-xs sm:text-sm md:text-base">
                    <option value="Explore">Explore</option>
                    <option value="Wordpress">Wordpress</option>
                    <option value="Shopify">Shopify</option>
                    <option value="Joomla">Joomla</option>
                    <option value="Openchart">Openchart</option>
                    <option value="Megento">Megento</option>
                    <option value="Webflow">Webflow</option>
                    <option value="React">React</option>
                    <option value="PrestaShop">PrestaShop</option>
                  </select>
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Find & Choose your perfect course"
                  className="placeholder:text-darkdeep4 w-full ml-2 md:ml-12 lg:ml-24 text-xs sm:text-sm md:text-base focus:outline-none"
                />
              </div>
              <div className="self-end ml-auto">
                <button
                  type="submit"
                  className="flex gap-x-1 items-center px-3 sm:px-25px py-2 sm:py-10px md:py-3 text-xs sm:text-size-15 text-whiteColor bg-primaryColor border border-primaryColor hover:text-primaryColor hover:bg-whiteColor rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ionicon w-3 sm:w-4 md:w-5"
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z"
                      fill="none"
                      stroke="currentColor"
                      strokeMiterlimit="10"
                      strokeWidth="32"
                    ></path>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeMiterlimit="10"
                      strokeWidth="32"
                      d="M338.29 338.29L448 448"
                    ></path>
                  </svg>
                  Search
                </button>
              </div>
            </form>

            <ul
              data-aos="fade-up"
              className="flex gap-x-5 flex-wrap justify-center items-center mt-7 md:mt-50px"
            >
              <li>
                <p className="text-whiteColor">
                  <i className="icofont-check-alt"></i>
                  <span className="ml-5px">More than 2k Courses</span>
                </p>
              </li>
              <li>
                <p className="text-whiteColor">
                  <i className="icofont-check-alt"></i>
                  <span className="ml-5px">1.1k Free Courses</span>
                </p>
              </li>
              <li>
                <p className="text-whiteColor">
                  <i className="icofont-check-alt"></i>
                  <span className="ml-5px">150+ Instructors</span>
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <Image
            className="absolute left-1/2 bottom-[15%] animate-spin-slow"
            src={registerImage2}
            alt=""
          />
          <Image
            className="absolute left-[42%] sm:left-[65%] md:left-[42%] lg:left-[5%] top-[4%] sm:top-[1%] md:top-[4%] lg:top-[10%] animate-move-hor"
            src={herobannerImage6}
            alt=""
          />
          <Image
            className="absolute right-[5%] bottom-[15%]"
            src={herobannerImage7}
            alt=""
          />
          <Image
            className="absolute top-[5%] left-[45%]"
            src={herobannerImage7}
            alt=""
          />
        </div>
      </div>
    </section>
  );
};

export default Hero6;
