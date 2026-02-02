import Link from "next/link";
import React from "react";

const MobileLinkSecondary = ({ item }) => {
  const { name, path, status } = item;
  return (
    <Link
      href={path}
      className="leading-1 text-darkdeep1 text-sm pl-30px pt-3 pb-7px font-light hover:text-secondaryColor dark:text-whiteColor dark:hover:text-secondaryColor"
    >
      {name}{" "}
      {status && (
        <span
          className={`px-15px py-5px ${
            status === "New" ? "text-secondaryColor" : "text-primaryColor"
          } bg-whitegrey3 text-xs rounded ml-5px`}
        >
          {status}
        </span>
      )}
    </Link>
  );
};

export default MobileLinkSecondary;
