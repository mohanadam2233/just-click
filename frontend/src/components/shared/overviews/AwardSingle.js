import Image from "next/image";
import Link from "next/link";
import React from "react";

const AwardSingle = ({ award }) => {
  const { title, id, image } = award;
  return (
    <div className="flex flex-col sm:flex-row gap-x-0 sm:gap-x-10 gap-y-5 sm:gapy-y-0 group p-15px transition-all duration-300 shadow-experience bg-whiteColor hover:bg-primaryColor dark:bg-whiteColor-dark dark:hover:bg-whiteColor rounded">
      <div>
        <Image
          src={image}
          alt=""
          className="w-full sm:w-48 md:w-40 lg:w-30 xl:w-148px 2xl:w-130px"
          placeholder="blur"
        />
      </div>
      <div>
        <h4 className="transition-all duration-300 text-contentColor group-hover:text-whiteColor dark:text-contentColor-dark dark:group-hover:text-whiteColor-dark">
          <Link
            href={`events/${id}`}
            className="text-size-15 md:text-lg lg:text-xl 2xl:text-2xl font-semibold hover:text-secondaryColor mr-0 2xl:mr-10 mb-15px"
          >
            {title}
          </Link>
        </h4>
        <div className="transition-all duration-300 text-blackColor group-hover:text-whiteColor dark:text-blackColor-dark dark:group-hover:text-whiteColor-dark">
          <Link href={`events/${id}`} className="hover:text-secondaryColor">
            Read More <i className="icofont-simple-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AwardSingle;
