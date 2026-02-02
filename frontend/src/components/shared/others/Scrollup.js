"use client";
import scrollUp from "@/libs/scrollUp";
import { useEffect } from "react";
// scroll up button
const Scrollup = () => {
  useEffect(() => {
    scrollUp();
  }, []);
  return (
    <div>
      <button className="scroll-up w-50px h-50px leading-50px text-center text-primaryColor bg-white hover:text-whiteColor hover:bg-primaryColor rounded-full fixed right-5 bottom-[60px] shadow-scroll-up z-medium text-xl dark:text-whiteColor dark:bg-primaryColor dark:hover:text-whiteColor-dark hidden">
        <i className="icofont-rounded-up"></i>
      </button>
    </div>
  );
};

export default Scrollup;
