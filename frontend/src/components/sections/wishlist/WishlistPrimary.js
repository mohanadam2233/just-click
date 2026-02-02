"use client";
import { useCartContext } from "@/contexts/CartContext";
import { useWishlistContext } from "@/contexts/WshlistContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const WishlistPrimary = () => {
  const { wishlistProducts, deleteProductFromWishlist } = useWishlistContext();
  const { addProductToCart } = useCartContext();
  const iswishlistProducts = wishlistProducts?.length ? true : false;
  return (
    <div>
      <div className="container py-50px lg:py-60px 2xl:py-20 3xl:py-100px">
        {/* cert table */}
        <div className="text-contentColor dark:text-contentColor-dark text-size-10 md:text-base overflow-auto">
          <table className="table-fixed md:table-auto leading-1.8 text-center w-150 md:w-full overflow-auto border border-borderColor dark:border-borderColor-dark box-content md:box-border">
            <thead>
              <tr className="md:text-sm text-blackColor dark:text-blackColor-dark uppercase font-medium border-b border-borderColor dark:border-borderColor-dark">
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Image
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Product
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Price
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Quantity
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Total
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Remove
                </th>
              </tr>
            </thead>
            <tbody>
              {!iswishlistProducts ? (
                <tr className="relative">
                  <td className="p-5 md:p-10 ">
                    <p className="absolute left-0 top-0 w-full h-full flex items-center justify-center  md:text-xl font-bold capitalize opacity-70 ">
                      empty
                    </p>
                  </td>
                </tr>
              ) : (
                wishlistProducts?.map(
                  (
                    { id, title, price, image, quantity, color, isCourse },
                    idx
                  ) => (
                    <tr
                      key={idx}
                      className="border-b border-borderColor dark:border-borderColor-dark"
                    >
                      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark">
                        <Link
                          href={`/${
                            isCourse ? "courses" : "ecommerce/products"
                          }/${id}`}
                        >
                          <Image
                            loading="lazy"
                            src={image}
                            alt="product-1"
                            className="max-w-20 w-full"
                          />
                        </Link>
                      </td>
                      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark w-300px">
                        <Link
                          className="hover:text-primaryColor"
                          href={`/${
                            isCourse ? "courses" : "ecommerce/products"
                          }/${id}`}
                        >
                          {title}
                        </Link>
                      </td>
                      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark">
                        <span className="amount">${price.toFixed(2)}</span>
                      </td>
                      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark w-300px">
                        <div className="mx-1">
                          <button
                            onClick={() =>
                              addProductToCart({
                                id,
                                title,
                                quantity,
                                color: isCourse ? "red" : color,
                                price,
                                image,
                                isCourse: isCourse || false,
                              })
                            }
                            className="text-xs md:text-size-15 text-whiteColor bg-primaryColor px-2 md:px-25px py-1 md:py-10px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor rounded group text-nowrap"
                          >
                            <span className="md:leading-1.8"> Add to cart</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark">
                        ${price?.toFixed(2)}
                      </td>
                      <td className="py-15px md:py-5">
                        <button className="hover:text-primaryColor mr-0.5 md:mr-1">
                          <svg
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 ionicon"
                            viewBox="0 0 512 512"
                          >
                            <title>Pencil</title>
                            <path
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="32"
                              d="M364.13 125.25L87 403l-23 45 44.99-23 277.76-277.13-22.62-22.62zM420.69 68.69l-22.62 22.62 22.62 22.63 22.62-22.63a16 16 0 000-22.62h0a16 16 0 00-22.62 0z"
                            ></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteProductFromWishlist(id, title)}
                          className="hover:text-primaryColor"
                        >
                          <svg
                            width="25"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 ionicon"
                            viewBox="0 0 512 512"
                          >
                            <title>Trash</title>
                            <path
                              d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="32"
                            ></path>
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeMiterlimit="10"
                              strokeWidth="32"
                              d="M80 112h352"
                            ></path>
                            <path
                              d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="32"
                            ></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WishlistPrimary;
