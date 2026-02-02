import Image from "next/image";
import React from "react";

const TestimonialSlide = ({ testimonial }) => {
  const { name, image, desc, desig } = testimonial;
  return (
    <div className="px-15px">
      <div className="p-5 md:p-10 md:pr-50px md:pb-50px bg-whiteColor dark:bg-whiteColor-dark rounded">
        <div className="flex justify-between items-center mb-15px lg:mb-30px">
          <div className="flex items-center gap-5">
            <div className="w-58px h-58px rounded-full">
              <Image
                src={image}
                alt=""
                className="w-full  rounded-full"
                placeholder="blur"
                quality={100}
              />
            </div>

            <div>
              <h5 className="text-lg md:text-size-22 text-blackColor dark:text-blackColor-dark font-semibold pb-1">
                {name}
              </h5>
              <p className="text-sm text-lightGrey9">{desig}</p>
            </div>
          </div>
          <div className="space-x-1">
            <i className="icofont-star text-xs md:text-lg text-yellow"></i>
            <i className="icofont-star text-xs md:text-lg text-yellow"></i>
            <i className="icofont-star text-xs md:text-lg text-yellow"></i>
            <i className="icofont-star text-xs md:text-lg text-yellow"></i>
            <i className="icofont-star text-xs md:text-lg text-lightGrey6"></i>
          </div>
        </div>
        <div>
          <p className="text-contentColor dark:text-contentColor-dark">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlide;
