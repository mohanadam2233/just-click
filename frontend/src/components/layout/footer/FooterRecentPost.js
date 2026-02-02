import useIsSecondary from "@/hooks/useIsSecondary";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const FooterRecentPost = ({ post }) => {
  const { title, date, image, id } = post;

  return (
    <li>
      <Link
        href={`/courses/${id}`}
        className="flex items-center gap-3 group cursor-pointer"
      >
        <div>
          <Image
            src={image}
            alt=""
            className="w-61px h-54px"
            placeholder="blur"
          />
        </div>
        <div>
          <p className="text-xs text-darkgray mb-7px">{date}</p>
          <h6 className="text-size-15 text-whiteColor font-bold group-hover:text-primaryColor transition-all duration-300">
            {title}
          </h6>
        </div>
      </Link>
    </li>
  );
};

export default FooterRecentPost;
