import Link from "next/link";
import React from "react";

const MobileLink = ({ item }) => {
  const { name, path } = item;
  return (
    <Link
      className="leading-1 py-11px text-darkdeep1 font-medium hover:text-secondaryColor dark:text-whiteColor dark:hover:text-secondaryColor"
      href={path}
    >
      {name}
    </Link>
  );
};

export default MobileLink;
