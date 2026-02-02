"use client";
import { useCartContext } from "@/contexts/CartContext";
import { useWishlistContext } from "@/contexts/WshlistContext";
import modal from "@/libs/modal";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import Reviews5Star from "../others/Reviews5Star";
let idx = -1;
const ProductCard = ({ product, handleCurrentProduct }) => {
  const {
    id,
    title,
    price,
    image,
    status,
    type,
    previousPrice,
    reviews,
    color,
  } = product;
  const { addProductToCart } = useCartContext();
  const { addProductToWishlist } = useWishlistContext();
  const depBgs = [
    "bg-secondaryColor",
    "bg-blue",
    "bg-greencolor2",
    "bg-yellow",
  ];

  idx = (idx + 1) % depBgs.length;
  useEffect(() => {
    modal();
  }, []);
  return (
    <div className=" group">
      <div className=" sm:px-15px mb-30px">
        <div className="p-15px bg-whiteColor shadow-brand dark:bg-darkdeep3-dark dark:shadow-brand-dark">
          {/* card image  */}
          <div className="relative">
            <Link
              href={`/ecommerce/products/${id}`}
              className="w-full overflow-hidden"
            >
              {image ? (
                <Image
                  src={image}
                  alt=""
                  className="w-full transition-all duration-300 group-hover:scale-110"
                  placeholder="blur"
                />
              ) : (
                ""
              )}
            </Link>
            <div className="absolute left-0 top-1 flex justify-between w-full items-center px-2">
              <div>
                <p
                  className={`text-xs text-whiteColor px-4 py-[3px]  rounded font-semibold ${depBgs[idx]}`}
                >
                  {status}
                </p>
              </div>

              <button
                onClick={() =>
                  addProductToWishlist({ ...product, quantity: 1 })
                }
                className="text-white bg-black bg-opacity-15 rounded hover:bg-primaryColor"
                href="#"
              >
                <i className="icofont-heart-alt text-base py-1 px-2"></i>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 transition-all duration-300 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:bottom-5">
              <ul className="flex gap-[6px] justify-center items-center">
                <li className="h-46px">
                  <Link href="#" data-tip="Add to compare" className="tooltip">
                    <svg
                      className="ionicon w-18px h-18px py-14px px-4 box-content text-contentColor bg-whiteColor hover:bg-primaryColor hover:text-whiteColor dark:text-contentColor-dark dark:bg-whiteColor-dark dark:hover:bg-primaryColor dark:hover:text-whiteColor transition-all duration-300 rounded"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="32"
                        d="M304 160l-64-64 64-64M207 352l64 64-64 64"
                      ></path>
                      <circle
                        cx="112"
                        cy="96"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="32"
                      ></circle>
                      <circle
                        cx="400"
                        cy="416"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="32"
                      ></circle>
                      <path
                        d="M256 96h84a60 60 0 0160 60v212M255 416h-84a60 60 0 01-60-60V144"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="32"
                      ></path>
                    </svg>
                  </Link>
                </li>
                <li className="h-46px tooltip" data-tip="Add to Cart">
                  <button
                    onClick={() =>
                      addProductToCart({
                        ...product,
                        quantity: 1,
                        color: color,
                      })
                    }
                    className="text-sm h-full leading-46px px-4 box-content text-contentColor bg-whiteColor hover:bg-primaryColor hover:text-whiteColor dark:text-contentColor-dark dark:bg-whiteColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor transition-all duration-300 rounded"
                  >
                    Add to cart
                  </button>
                </li>
                <li className="h-46px">
                  <button
                    data-tip="Quick View"
                    className="tooltip modal-open"
                    onMouseEnter={() => handleCurrentProduct(id)}
                  >
                    <svg
                      className="ionicon w-18px h-18px py-14px px-4 box-content text-contentColor bg-whiteColor hover:bg-primaryColor hover:text-whiteColor dark:text-contentColor-dark dark:bg-whiteColor-dark dark:hover:bg-primaryColor dark:hover:text-whiteColor transition-all duration-300 rounded"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path
                        d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="32"
                      ></path>
                      <circle
                        cx="256"
                        cy="256"
                        r="80"
                        fill="none"
                        stroke="currentColor"
                        strokeMiterlimit="10"
                        strokeWidth="32"
                      ></circle>
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* card content  */}
          <div>
            <Link
              href={`/ecommerce/products/${id}`}
              className="text-xl md:text-size-22 font-medium text-blackColor mb-10px mt-5 font-hind dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor"
            >
              {title}
            </Link>
            {/* price  */}
            <div className="text-2xl font-semibold text-primaryColor font-inter mb-4">
              ${price.toFixed(2)}
              <del className="text-base text-lightGrey4 font-semibold">
                / ${previousPrice.toFixed(2)}
              </del>
            </div>
            {/* rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 pt-15px border-t border-borderColor">
              <div>
                <Link
                  href={`/ecommerce/shop?category=${type.toLowerCase()}`}
                  className="text-base text-contentColor hover:text-primaryColor dark:text-contentColor-dark dark:hover:text-primaryColor"
                >
                  {type}
                </Link>
              </div>
              <Reviews5Star reviews={reviews} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
