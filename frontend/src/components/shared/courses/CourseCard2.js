"use client";
import { useWishlistContext } from "@/contexts/WshlistContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";
let insId = 0;
const CourseCard2 = ({ course, card, isList, isNotSidebar }) => {
  const { addProductToWishlist } = useWishlistContext();
  const {
    id,
    title,
    lesson,
    duration,
    image,
    price,
    isFree,
    insName,
    insImg,
    categories,
  } = course;

  const depBgs = [
    {
      category: "Art & Design",
      bg: "bg-secondaryColor",
    },

    {
      category: "Development",
      bg: "bg-blue",
    },

    {
      category: "Lifestyle",
      bg: "bg-secondaryColor2",
    },

    {
      category: "Web Design",
      bg: "bg-greencolor2",
    },

    {
      category: "Business",
      bg: "bg-orange",
    },

    {
      category: "Art & Design",
      bg: "bg-yellow",
    },
    {
      category: "Personal Development",
      bg: "bg-secondaryColor",
    },

    {
      category: "Marketing",
      bg: "bg-blue",
    },

    {
      category: "Photography",
      bg: "bg-secondaryColor2",
    },

    {
      category: "Data Science",
      bg: "bg-greencolor2",
    },

    {
      category: "Health & Fitness",
      bg: "bg-orange",
    },

    {
      category: "Mobile Application",
      bg: "bg-yellow",
    },
  ];

  const cardBg = depBgs?.find(
    ({ category: category1 }) => category1 === categories
  )?.bg;
  insId = id;
  insId = insId % 6 ? insId % 6 : 6;
  return (
    <div className="w-full group grid-item rounded">
      <div className="tab-content-wrapper">
        <div
          className={`p-15px lg:pr-30px bg-whiteColor shadow-brand dark:bg-darkdeep3-dark dark:shadow-brand-dark flex flex-wrap ${
            card ? "lg:flex-nowrap" : "md:flex-nowrap"
          } rounded`}
        >
          {/*  card image */}
          <div
            className={`relative overflow-hidden w-full leading-1 ${
              card ? " lg:w-2/5" : "md:w-35%"
            }`}
          >
            <Link
              href={`courses/${id}`}
              className="w-full overflow-hidden rounded"
            >
              <Image
                src={image}
                alt=""
                className="w-full transition-all duration-300 scale-105 group-hover:scale-110 -mb-1"
                placeholder="blur"
              />
            </Link>
            <div className="absolute left-0 top-1 flex justify-between w-full items-center px-2">
              <div>
                <p
                  className={`text-xs text-whiteColor px-4 py-[3px]  rounded font-semibold capitalize ${cardBg}`}
                >
                  {categories}
                </p>
              </div>
              <button
                className="text-white bg-black bg-opacity-15 rounded hover:bg-primaryColor"
                onClick={() =>
                  addProductToWishlist({
                    ...course,
                    isCourse: true,
                    quantity: 1,
                  })
                }
              >
                <i className="icofont-heart-alt text-base py-1 px-2"></i>
              </button>
            </div>
          </div>
          {/*  card content */}
          <div className={`w-full ${card ? "lg:w-3/5" : "md:w-65% "}`}>
            <div
              className={`${`pl-0 md:pl-5  lg:pl-30px  ${
                isNotSidebar ? "2xl:pl-90px" : ""
              }`} 
              `}
            >
              <div className="grid grid-cols-2 mb-15px">
                <div className="flex items-center">
                  <div>
                    <i className="icofont-book-alt pr-5px text-primaryColor text-lg"></i>
                  </div>
                  <div>
                    <span className="text-sm text-black dark:text-blackColor-dark">
                      {lesson}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <i className="icofont-clock-time pr-5px text-primaryColor text-lg"></i>
                  </div>
                  <div>
                    <span className="text-sm text-black dark:text-blackColor-dark">
                      {duration}
                    </span>
                  </div>
                </div>
              </div>
              <h4>
                <Link
                  href={`courses/${id}`}
                  className={`${
                    card
                      ? "text-size-26 leading-30px "
                      : "text-xl 2xl:text-size-34 2xl:!leading-9"
                  }  font-semibold text-blackColor mb-10px  dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor`}
                >
                  {title}
                </Link>
              </h4>
              {/*  price */}
              <div className="text-lg font-medium text-black-brerry-light mb-4">
                ${price.toFixed(2)}
                <del className="text-sm text-lightGrey4 font-semibold">
                  / $67.00
                </del>
                <span
                  className={`ml-6 text-base font-semibold ${
                    isFree ? " text-greencolor" : " text-secondaryColor3"
                  }`}
                >
                  {isFree ? "Free" : <del>Free</del>}
                </span>
              </div>
              {/*  bottom */}
              <div className="flex flex-wrap justify-between sm:flex-nowrap items-center gap-y-2 pt-15px border-t border-borderColor">
                {/*  author and rating*/}
                <div className="flex items-center flex-wrap">
                  <div>
                    <Link
                      href={`/instructors/${insId}`}
                      className="text-sm font-medium font-hind flex items-center hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor"
                    >
                      <Image
                        className="w-[30px] h-[30px] rounded-full mr-15px"
                        src={insImg}
                        alt=""
                      />
                      <span className="flex">{insName}</span>
                    </Link>
                  </div>
                  <div className="text-start md:text-end ml-35px">
                    <i className="icofont-star text-size-15 text-yellow"></i>
                    <i className="icofont-star text-size-15 text-yellow"></i>
                    <i className="icofont-star text-size-15 text-yellow"></i>
                    <i className="icofont-star text-size-15 text-yellow"></i>

                    <span className="text-xs text-lightGrey6">(44)</span>
                  </div>
                </div>

                <div>
                  <Link
                    className="text-sm lg:text-base text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor"
                    href={`/courses/${id}`}
                  >
                    Know Details
                    <i className="icofont-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard2;
