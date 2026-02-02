"use client";
import { useWishlistContext } from "@/contexts/WshlistContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";
let insId = 0;
const CourseCard = ({ course, type }) => {
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
    filterOption,
    isActive,
    isCompleted,
    completedParchent,
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
    <div
      className={`group  ${
        type === "primary" || type === "primaryMd"
          ? ""
          : `w-full sm:w-1/2 lg:w-1/3 grid-item ${
              type === "lg" ? "xl:w-1/4" : ""
            }`
      } ${filterOption ? filterOption : ""}`}
    >
      <div className={`  ${type === "primaryMd" ? "" : "sm:px-15px  mb-30px"}`}>
        <div className="p-15px bg-whiteColor shadow-brand dark:bg-darkdeep3-dark dark:shadow-brand-dark">
          {/* card image */}
          <div className="relative mb-2">
            <Link
              href={`/courses/${id}`}
              className="w-full overflow-hidden rounded"
            >
              <Image
                src={image}
                alt=""
                priority={true}
                className="w-full transition-all duration-300 group-hover:scale-110"
              />
            </Link>
            <div className="absolute left-0 top-1 flex justify-between w-full items-center px-2">
              <div>
                <p
                  className={`text-xs text-whiteColor px-4 py-[3px]  rounded font-semibold ${cardBg}`}
                >
                  {categories}
                </p>
              </div>
              <button
                onClick={() =>
                  addProductToWishlist({
                    ...course,
                    isCourse: true,
                    quantity: 1,
                  })
                }
                className="text-white bg-black bg-opacity-15 rounded hover:bg-primaryColor"
              >
                <i className="icofont-heart-alt text-base py-1 px-2"></i>
              </button>
            </div>
          </div>
          {/* card content */}
          <div>
            <div className="grid grid-cols-2 mb-3">
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
            <h5 className={`${type === "primaryMd" ? "text-lg " : "text-xl "}`}>
              <Link
                href={`/courses/${id}`}
                className={`font-semibold text-blackColor mb-10px dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor ${
                  type === "primaryMd" ? "leading-25px" : "leading-27px "
                } `}
              >
                {title}
              </Link>
            </h5>
            {/* price */}
            <div className="text-lg font-semibold text-primaryColor  mb-4">
              ${price.toFixed(2)}
              <del className="text-sm text-lightGrey4 font-semibold ml-1">
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
            {/* author and rating--> */}
            <div className="grid grid-cols-1 md:grid-cols-2 pt-15px border-t border-borderColor">
              <div>
                <h6>
                  <Link
                    href={`/instructors/${insId}`}
                    className="text-base font-bold  flex items-center hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor"
                  >
                    <Image
                      className="w-[30px] h-[30px] rounded-full mr-15px"
                      src={insImg}
                      alt=""
                      placeholder="blur"
                    />
                    <span className="whitespace-nowrap">{insName}</span>
                  </Link>
                </h6>
              </div>
              <div className="text-start md:text-end space-x-1">
                <i className="icofont-star text-size-15 text-yellow"></i>
                <i className="icofont-star text-size-15 text-yellow"></i>
                <i className="icofont-star text-size-15 text-yellow"></i>
                <i className="icofont-star text-size-15 text-yellow"></i>
                {type === "primaryMd" ? (
                  ""
                ) : (
                  <i className="icofont-star text-size-15 text-yellow"></i>
                )}
                <span className="text-xs text-lightGrey6">(44)</span>
              </div>
            </div>
            {isCompleted || isActive ? (
              <div>
                <div className="h-25px w-full bg-blue-x-light rounded-md relative mt-5 mb-15px">
                  <div
                    className={`text-center bg-primaryColor absolute top-0 left-0  rounded-md leading-25px `}
                    style={{
                      width: isActive ? completedParchent + "%" : "100%",
                      height: "100%",
                    }}
                  >
                    <span className="text-size-10 text-whiteColor block leading-25px">
                      {isActive ? completedParchent : 100}% Complete
                    </span>
                  </div>
                </div>
                {isCompleted ? (
                  <div>
                    <Link
                      href="/dashboards/create-course"
                      className="text-size-15 text-whiteColor bg-secondaryColor w-full px-25px py-10px border border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor rounded group text-nowrap text-center"
                    >
                      Download Certificate
                    </Link>
                  </div>
                ) : (
                  ""
                )}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
