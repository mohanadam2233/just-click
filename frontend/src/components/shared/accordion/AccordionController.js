"use client";

import accordions from "@/libs/accordions";
import { useEffect } from "react";

const AccordionController = ({ children, type }) => {
  useEffect(() => {
    accordions();
  }, []);
  return (
    <div
      className={type === "primary" ? "flex items-center justify-between" : ""}
    >
      {type === "primary" ? (
        <>
          {children}
          <button className="accordion-controller px-3 py-4">
            <span className="w-[10px] h-[1px] bg-darkdeep1 block dark:bg-whiteColor"></span>
            <span className="w-[10px] h-[1px] bg-darkdeep1 block dark:bg-whiteColor rotate-90 -mt-[1px] transition-all duration-500"></span>
          </button>
        </>
      ) : (
        <button
          className={`accordion-controller flex justify-between items-center text-headingColor font-bold w-full  dark:text-headingColor-dark text-start leading-[20px] ${
            type === "secondaryLg"
              ? "px-10px pt-14px pb-15px md:px-25px md:pt-6 md:pb-25px outline-4 outline-transparent transition-none border-b border-transparent text-lg md:text-xl "
              : "px-5 py-18px text-xl "
          }`}
        >
          <span>{children}</span>

          <svg
            className="flex-shrink-0 transition-all duration-500 rotate-0"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="#212529"
          >
            <path
              fillRule="evenodd"
              d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
            ></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default AccordionController;
