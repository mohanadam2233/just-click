import { useWishlistContext } from "@/contexts/WshlistContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const HeroSlide = ({ card, idx }) => {
  const { image, department, lesson, duration, price, insName, insImg, id } =
    card;
  const { addProductToWishlist } = useWishlistContext();
  const depBgs = [
    "bg-secondaryColor",
    "bg-blue",
    "bg-secondaryColor2",
    "bg-greencolor2",
    "bg-orange",
    "bg-yellow",
  ];
  return (
    <div>
      <div className="p-25px bg-whiteColor dark:bg-darkdeep3-dark  ">
        {/* card image */}
        <div className="relative mb-4">
          <Link
            href={`courses/${id}`}
            className="w-full overflow-hidden rounded"
          >
            <Image
              src={image}
              alt=""
              className="w-full transition-all duration-300 group-hover:scale-110"
              placeholder="blur"
            />
          </Link>
          <div className="absolute left-0 top-1 flex justify-between w-full items-center px-2">
            <div>
              <p
                className={`text-xs text-whiteColor px-4 py-[3px]  rounded font-semibold ${
                  idx < depBgs.length
                    ? depBgs[idx]
                    : depBgs[Math.floor(Math.random() * 6)]
                }`}
              >
                {department}
              </p>
            </div>
            <button
              onClick={() =>
                addProductToWishlist({
                  ...card,
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
          <Link
            href={`courses/${id}`}
            className="text-2xl font-semibold text-blackColor mb-10px font-hind dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor"
          >
            Figma to HTML
          </Link>
          <p className="text-contentColor dark:text-contentColor-dark mb-15px">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veniam,
            libero!
          </p>
          {/* price */}
          <div className="text-lg font-semibold text-primaryColor font-inter mb-4">
            ${price.toFixed(2)}
            <del className="text-sm text-lightGrey4 font-semibold">
              / $67.00
            </del>
            <span className="ml-6">
              <del className="text-base font-semibold text-secondaryColor3">
                Free
              </del>
            </span>
          </div>
          {/* author and ratin */}
          <div className="grid grid-cols-1 md:grid-cols-2 pt-15px border-t border-borderColor">
            <div>
              <Link
                href={`instructors/${id}`}
                className="text-base font-bold font-hind flex items-center hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor"
              >
                <Image
                  className="w-[30px] h-[30px] rounded-full mr-15px"
                  src={insImg}
                  alt=""
                />
                <span className="flex">{insName}</span>
              </Link>
            </div>
            <div className="text-start md:text-end">
              <i className="icofont-star text-size-15 text-yellow"></i>
              <i className="icofont-star text-size-15 text-yellow"></i>
              <i className="icofont-star text-size-15 text-yellow"></i>
              <i className="icofont-star text-size-15 text-yellow"></i>
              <i className="icofont-star text-size-15 text-yellow"></i>
              <span className="text-xs text-lightGrey6">(44)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlide;
