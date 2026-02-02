import Image from "next/image";
import React from "react";
import registrationImage1 from "@/assets/images/register/register__1.png";
import registrationImage2 from "@/assets/images/register/register__2.png";
import registrationImage3 from "@/assets/images/register/register__3.png";
import PopupVideo from "@/components/shared/popup/PopupVideo";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

const Registration = () => {
  return (
    <section className="bg-register bg-cover bg-center bg-no-repeat lg:mb-150px">
      {/* registration overlay  */}
      <div className="overlay bg-blueDark bg-opacity-90 py-20 lg:pt-[90px] lg:pb-0 relative z-0">
        {/* animate icons  */}
        <div>
          <Image
            className="absolute top-0 left-0 lg:left-[8%] 2xl:top-10 animate-move-hor block z--1"
            src={registrationImage1}
            alt=""
          />
          <Image
            className="absolute top-1/2 left-3/4 md:left-2/3 lg:left-1/2 2xl:left-[8%] md:top animate-spin-slow block z--1"
            src={registrationImage2}
            alt=""
          />
          <Image
            className="absolute top-20 lg:top-3/4 md:top-14 right-20 md:right-20 lg:right-[90%] animate-move-var block z--1"
            src={registrationImage3}
            alt=""
          />
        </div>
        <div className="container">
          {/* about section   */}
          <div className="grid grid-cols-1 lg:grid-cols-12 pt-30px gap-x-30px">
            {/* about left  */}
            <div
              className="mb-30px lg:mb-0 pb-0 md:pb-30px xl:pb-0 lg:col-start-1 lg:col-span-7"
              data-aos="fade-up"
            >
              <div className="relative">
                <span className="text-sm font-semibold text-primaryColor bg-whitegrey3 px-6 py-5px mb-5 rounded-full inline-block">
                  Registration
                </span>
                <h3 className="text-3xl md:text-[35px] 2xl:text-size-42 leading-[45px] 2xl:leading-2xl font-bold text-whiteColor pb-25px">
                  Register Your{" "}
                  <span className="relative after:w-full after:h-[7px] after:bg-secondaryColor after:absolute after:left-0 after:bottom-2 md:after:bottom-4 z-0 after:z-[-1]">
                    Account
                  </span>{" "}
                  Get free access to{" "}
                  <span className="text-yellow1">60000 </span> online course
                </h3>
                <div className="flex gap-x-5 items-center">
                  <PopupVideo />

                  <div>
                    <p className="text-size-15 md:text-[22px] lg:text-lg 2xl:text-[22px] leading-6 md:leading-9 lg:leading-8 2xl:leading-9 font-semibold text-white">
                      Learn Something new & Build Your Career From Anywhere In
                      The World
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* sbject right  */}
            <div className="overflow-visible lg:col-start-8 lg:col-span-5 relative z-1 lg:-mb-150px">
              <form
                className="p-35px pt-10 bg-lightGrey10 dark:bg-lightGrey10-dark rounded shadow-experience"
                data-aos="fade-up"
              >
                <h3 className="text-xl text-blackColor dark:text-blackColor-dark font-semibold mb-5 font-inter">
                  Fill Your Registration
                </h3>

                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-15px py-3 bg-lightGrey8 text-base mb-25px focus:outline-none"
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-30px">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-15px py-3 bg-lightGrey8 text-base mb-25px focus:outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Phone"
                    className="w-full px-15px py-3 bg-lightGrey8 text-base mb-25px focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full px-15px py-3 bg-lightGrey8 text-base mb-25px focus:outline-none"
                />

                <textarea
                  placeholder="Comment"
                  className="w-full px-15px pb-3 pt-5 bg-lightGrey8 text-base mb-25px h-[155px] placeholder:text-blackColor"
                  cols="30"
                  rows="10"
                />
                <div>
                  <ButtonPrimary type="submit" arrow={true}>
                    Sign Up
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Registration;
