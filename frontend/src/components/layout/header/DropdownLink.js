import Link from "next/link";
import React from "react";

const DropdownLink = ({ item }) => {
  const { name, status, type, dropdown, path } = item;
  return (
    <Link
      href={path}
      className={`whitespace-nowrap text-sm 2xl:text-base font-semibold text-contentColor border-l-2 border-transparent transition duration-300 hover:border-primaryColor block hover:bg-whitegrey1 hover:text-primaryColor leading-sm 3xl:leading-lg dark:text-whiteColor dark:hover:bg-whitegrey1-dark dark:hover:text-primaryColor ${
        type === "secondary" || dropdown
          ? "flex justify-between items-center px-25px py-10px "
          : "p-10px "
      }`}
    >
      {name}
      {status && status !== "New" && (
        <span className="text-size-12 font-semibold text-primaryColor bg-whitegrey3 px-15px py-5px ml-5px rounded leading-1">
          {status}
        </span>
      )}
      {status === "New" && (
        <span className="text-size-12 font-semibold text-secondaryColor bg-whitegrey3 px-15px py-5px ml-5px rounded leading-1">
          {status}
        </span>
      )}

      {dropdown && <i className="icofont-rounded-right"></i>}
    </Link>
  );
};

export default DropdownLink;
