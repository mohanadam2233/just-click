import Link from "next/link";
import React from "react";

const FooterNavItem = ({ name, path }) => {
  return (
    <li>
      <Link
        href={path}
        className="text-darkgray relative hover:text-primaryColor after:transition-all after:duration-300 after:w-0 after:h-2px after:absolute after:bg-primaryColor hover:after:w-full after:bottom-0 after:left-0"
      >
        {name}
      </Link>
    </li>
  );
};

export default FooterNavItem;
