import Image from "next/image";
import Link from "next/link";
import React from "react";

const TestimonialSlide2 = ({ testimonial }) => {
  const { name, image, desig, desc } = testimonial;
  return (
    <div>
      <p className="md:text-xl md:leading-10 text-lightGrey dark:text-whiteColor">
        <i className="icofont-quote-left quote__left text-primaryColor text-xl"></i>
        {desc}
        <i className="icofont-quote-right quote__right text-primaryColor text-xl"></i>
      </p>

      <div className="flex items-center pt-10">
        <div className="pr-18px">
          <Image
            src={image}
            alt=""
            className="w-18 h-78 rounded-full"
            placeholder="blur"
          />
        </div>
        <div>
          <h4>
            <Link
              href="#"
              className="text-size-22 font-semibold text-contentColor hover:text-primaryColor dark:hover:text-primaryColor dark:text-contentColor-dark"
            >
              {name}
            </Link>
          </h4>
          <Link href="#" className="text-primaryColor">
            {desig}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlide2;
