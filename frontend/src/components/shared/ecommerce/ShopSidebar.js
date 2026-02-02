"use client";

import { useState } from "react";
import ButtonPrimary from "../buttons/ButtonPrimary";

const filterAccordions = [
  {
    controllerName: "Availability",
    inputName: "availability",
    checks: ["In stock", "Out of stock"],
  },
  {
    controllerName: "Product type",
    inputName: "productType",
    checks: ["Apparel & Accessories", "Jacket"],
  },
  {
    controllerName: "Brand",
    inputName: "brand",
    checks: ["Apple", "Amazon"],
  },
  {
    controllerName: "Color",
    inputName: "color",
    checks: [
      "Black",
      "Blue",
      "Grey",
      "Pink",
      "Red",
      "Violet",
      "White",
      "Yellow",
    ],
  },
  {
    controllerName: "Size",
    inputName: "size",
    checks: ["S", "M", "L", "XL", "XXL"],
  },
];

const ShopSidebar = ({
  handleFilters,
  availability,
  type,
  brand,
  color,
  size,
  handleReset,
  category,
}) => {
  return (
    <div
      className={`modal-container ${
        category ? "" : "xl:col-start-1 xl:col-span-3"
      }`}
    >
      <div
        className="mb-35px flex justify-between items-center"
        data-aos="fade-up"
      >
        <h4 className="text-size-22 leading-1.2 font-bold text-blackColor dark:text-blackColor-dark">
          Filter:
        </h4>
        <button
          onClick={handleReset}
          className="text-contentColor  dark:text-contentColor-dark  border-b border-blackColor   dark:border-blackColor-dark hover:text-primaryColor hover:border-b-primaryColor dark:hover:text-primaryColor   dark:hover:border-b-primaryColor leading-1.2"
        >
          Remove all
        </button>
      </div>
      <div className="mb-30px" data-aos="fade-up">
        <ButtonPrimary
          type={"button"}
          onClick={() => handleFilters(null, null, null, true)}
        >
          $0.00-$80.00
        </ButtonPrimary>
      </div>
      {/* accordion filters */}
      <div className="gap-y-50px flex flex-col mb-50px text-blackColor dark:text-blackColor-dark leading-1.8">
        {/* Availability */}
        {filterAccordions?.map(({ controllerName, checks, inputName }, idx) => (
          <ul key={idx} className="accordion-container" data-aos="fade-up">
            <li className="accordion active shadow-accordion2 dark:shadow-accordion-dark p-5">
              <div className="accordion-controller cursor-pointer block w-full">
                <div className="flex items-center">
                  <p className="w-0 h-0 border-x-9 border-y-5px border-transparent border-l-blackColor dark:border-l-blackColor-dark inline-block translate-x-1"></p>

                  <p className="ml-0.5">{controllerName}</p>
                </div>
              </div>
              <div className="accordion-content overflow-hidden">
                <div className="content-wrapper pt-10px">
                  <ul className="flex flex-col gap-y-10px">
                    {checks?.map((check, idx1) => (
                      <li key={idx1} className="flex items-center gap-1">
                        <input
                          checked={
                            inputName === "availability"
                              ? availability.includes(check) || false
                              : inputName === "productType"
                              ? type.includes(check) || false
                              : inputName === "brand"
                              ? brand.includes(check)
                              : inputName === "color"
                              ? color.includes(check) || false
                              : inputName === "size"
                              ? size.includes(check) || false
                              : false
                          }
                          type="checkbox"
                          id={check}
                          onChange={(e) => handleFilters(e, inputName, check)}
                        />{" "}
                        <label htmlFor={check}> {check}</label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default ShopSidebar;
