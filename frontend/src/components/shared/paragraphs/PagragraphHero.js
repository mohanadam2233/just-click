import React from "react";

const PagragraphHero = ({ children, color }) => {
  return (
    <p
      className={`text-size-15 lg:text-base 2xl:text-lg  mb-5 2xl:mb-30px  ${
        color === "white"
          ? "text-whiteColor"
          : "text-contentColor dark:text-contentColor-dark"
      }`}
    >
      {children}
    </p>
  );
};

export default PagragraphHero;
