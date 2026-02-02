import Link from "next/link";
import React from "react";

const Subject3 = ({ subject }) => {
  const { title, desc } = subject;
  return (
    <Link
      href={`/courses?category=${
        title ? title.split(" ").join("_").toLowerCase() : "#"
      }`}
      className="pt-5 pb-15px px-30px rounded-5px bg-borderColor text-center hover:bg-secondaryColor dark:bg-borderColor-dark dark:hover:bg-secondaryColor group"
      data-aos="fade-up"
    >
      <h4 className="text-blackColor text-lg font-medium group-hover:text-blackColor-dark dark:text-blackColor-dark">
        {title}
      </h4>
      <p className="text-xs text-contentColor group-hover:text-contentColor-dark dark:text-contentColor-dark">
        {desc}
      </p>
    </Link>
  );
};

export default Subject3;
