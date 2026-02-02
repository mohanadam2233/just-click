import Image from "next/image";
import React from "react";
import herobannerImage1 from "@/assets/images/herobanner/herobanner__1.png";
const BookImage = ({ type }) => {
  return (
    <Image
      className={`absolute ${
        type === "secondary"
          ? "left-0 bottom-0 md:left-[14px] lg:left-[50px] lg:bottom-[21px] 2xl:left-[165px] 2xl:bottom-[60px]"
          : "left-10 bottom-[233px] md:left-[248px] md:bottom-[143px] lg:left-10 lg:bottom-[112px] 3xl:bottom-[233px] opacity-35"
      } animate-move-var  z-10`}
      src={herobannerImage1}
      alt=""
    />
  );
};

export default BookImage;
