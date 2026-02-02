import Image from "next/image";
import Link from "next/link";
import React from "react";

const Subject = ({ subject, type }) => {
  const { title, desc, navButton, svg, translate, image, id, category } =
    subject;
  const path = `/courses?category=${
    category ? category.split(" ").join("_").toLowerCase() : "#"
  }`;
  return (
    <div data-aos="fade-up">
      <div className={translate ? "md:translate-y-[30px]" : ""}>
        <div
          className={`${
            type === "primary" ? "p-30px" : "p-35px"
          } group bg-whiteColor rounded-xl transition-all duration-300 shadow-dropdown-secodary hover:bg-primaryColor hover:-translate-y-5px hover:text-whiteColor dark:bg-whiteColor-dark dark:hover:bg-primaryColor`}
        >
          {/* card svg */}
          <div className="-translate-y-2 flex justify-between overflow-hidden mb-0 md:mb-1 lg:mb-3">
            {image ? (
              <div className="relative w-15 h-15">
                <Image
                  loading="lazy"
                  src={image}
                  alt=""
                  className="w-full"
                  placeholder="blur"
                />
              </div>
            ) : (
              svg
            )}

            <div className="service__small__img w-7 h-[60px]">
              <svg
                className="icon__hover__img w-7 h-[60px] opacity-0 group-hover:opacity-100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5961 10.265L19 1.33069L10.0022 3.73285L1 6.1306L7.59393 12.6627L14.1879 19.1992L16.5961 10.265Z"
                  stroke="#FFB31F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
          </div>
          {/* card content */}
          <div>
            <h3>
              <Link
                href={path}
                className={`${
                  type === "primary"
                    ? "text-size-22 sm:text-size-17 md:text-size-22 lg:text-size-17 2xl:text-size-22 leading-29px sm:leading-15px md:leading-29px lg:leading-15px 2xl:leading-29px font-semibold mb-5px "
                    : "text-size-23 lg:text-lg 2xl:text-size-23 mb-2 md:-mb-1 2xl:mb-10px"
                } font-semibold  hover:text-secondaryColor  dark:text-whiteColor dark:hover:text-secondaryColor `}
              >
                {title}
              </Link>
            </h3>

            <p
              className={`${
                type === "primary"
                  ? "leading-29px"
                  : "text-sm lg:text-xs 2xl:text-sm mb-15px lg:mb-2 2xl:mb-15px"
              }  text-contentColor group-hover:text-whiteColor  transition-all duration-300`}
            >
              {desc}
            </p>
            {navButton && (
              <div>
                <div className="text-sm text-black dark:text-blackColor-darkColor group-hover:text-whiteColor dark:text-blackColor-dark dark:group-hover:text-whiteColor-dark">
                  <Link
                    href={path}
                    className="text-sm font-medium hover:text-secondaryColor "
                  >
                    View Subject
                    <i className="icofont-long-arrow-right"></i>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subject;
