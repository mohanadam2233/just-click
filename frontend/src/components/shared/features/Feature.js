import React from "react";

const Feature = ({ feature }) => {
  const { title, id, desc } = feature;
  return (
    <div
      className={`p-5 md:p-26px md:pr-30px transition-all duration-300 border border-borderColor5 ${
        id === 0 || id === 3
          ? "hover:border-primaryColor "
          : id === 1
          ? "hover:border-greencolor "
          : id === 2
          ? "hover:border-secondaryColor"
          : ""
      } hover:shadow-feature flex rounded`}
      data-aos="fade-up"
    >
      <div className="w-71.94px h-69.44px leading-69.44px bg-primaryColor bg-opacity-5 border border-primaryColor text-center mr-35px rounded-100 border-opacity-10">
        <i
          className={`${
            id === 0 || id === 3
              ? "icofont-video-alt text-primaryColor"
              : id === 1
              ? "icofont-business-man-alt-1 text-greencolor"
              : id === 2
              ? "icofont-book-alt text-secondaryColor"
              : ""
          }  text-size-26 `}
        ></i>
      </div>
      <div>
        <h3>
          <a
            className={`text-xl lg:text-lg 3xl:text-xl font-semibold text-contentColor mb-1 dark:text-contentColor-dark  ${
              id === 0 || id === 3
                ? "hover:text-primaryColor   dark:hover:text-primaryColor"
                : id === 1
                ? "hover:text-greencolor dark:hover:text-greencolor"
                : id === 2
                ? "hover:text-secondaryColor  dark:hover:text-secondaryColor"
                : ""
            }`}
            href="#"
          >
            {title}
          </a>
        </h3>
        <p className="text-sm text-lightGrey3">{desc}</p>
      </div>
    </div>
  );
};

export default Feature;
