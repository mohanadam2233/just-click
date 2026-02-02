import Image from "next/image";
import React from "react";

const Program = ({ program }) => {
  const { title, ageRange, image } = program;
  return (
    <div className="shadow-dropdown-secodary" data-aos="fade-up">
      <div className="p-10px">
        <Image src={image} alt="" className="w-full" />
      </div>
      <div className="pt-30px pr-5 pb-10 pl-30px md:py-5 md:px-10px lg:pt-30px lg:pr-10px lg:pb-10 lg:pl-5 2xl:pt-30px 2xl:pr-5 2xl:pb-10 2xl:pl-30px">
        <p className="text-primaryColor font-bold uppercase mb-15px">
          {ageRange}
        </p>
        <h4 className="text-2xl md:text-size-34 lg:text-2xl 2xl:text-xl 3xl:text-size-34 font-bold">
          <a
            href="#"
            className="leading-1.2 text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor mb-5"
          >
            {title}
          </a>
        </h4>
        <a
          href="#"
          className="font-medium text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor"
        >
          Read More
        </a>
      </div>
    </div>
  );
};

export default Program;
