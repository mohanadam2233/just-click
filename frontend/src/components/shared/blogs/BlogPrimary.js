import Image from "next/image";
import Link from "next/link";
import React from "react";
import PopupVideo from "../popup/PopupVideo";

const BlogPrimary = ({ blog, idx }) => {
  const { title, image, author, desc, id, date, month } = blog;
  return (
    <div className="group shadow-blog2" data-aos="fade-up">
      {/* blog thumbnail  */}
      <div className="overflow-hidden relative">
        <Image src={image} alt="" className="w-full" placeholder="blur" />
        <div className="text-size-22 leading-6 font-semibold text-white px-15px py-5px md:px-6 md:py-2 bg-primaryColor rounded text-center absolute top-5 right-5">
          <h3>
            {date} <br />
            {month}
          </h3>
        </div>

        {idx === 1 ? (
          <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-10">
            {" "}
            <PopupVideo />
          </div>
        ) : (
          ""
        )}
      </div>
      {/* blog content  */}
      <div className="pt-26px pb-5 px-30px">
        <h3 className="text-2xl md:text-size-32 lg:text-size-28 2xl:text-size-34 leading-34px md:leading-10 2xl:leading-13.5 font-bold text-blackColor2 hover:text-primaryColor dark:text-blackColor2-dark dark:hover:text-primaryColor">
          <Link href={`/blogs/${id}`}>{title}</Link>
        </h3>
        <div className="mb-14px pb-19px border-b border-borderColor dark:border-borderColor-dark">
          <ul className="flex flex-wrap items-center gap-x-15px">
            <li>
              <Link
                href={`/blogs/${id}`}
                className="text-contentColor text-sm hover:text-primaryColor dark:text-contentColor-dark dark:hover:text-primaryColor"
              >
                <i className="icofont-business-man-alt-2"></i> {author?.name}
              </Link>
            </li>
            <li>
              <Link
                href={`/blogs/${id}`}
                className="text-contentColor text-sm hover:text-primaryColor dark:text-contentColor-dark dark:hover:text-primaryColor"
              >
                <i className="icofont-speech-comments"></i> 0 Comments
              </Link>
            </li>
            <li>
              <Link
                href={`/blogs/${id}`}
                className="text-contentColor text-sm hover:text-primaryColor dark:text-contentColor-dark dark:hover:text-primaryColor"
              >
                <i className="icofont-eraser-alt"></i> Association
              </Link>
            </li>
          </ul>
        </div>
        <p className="text-base text-contentColor dark:text-contentColor-dark mb-15px !leading-30px">
          {desc}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <Link
              href={`/blogs/${id}`}
              className="uppercase text-primaryColor hover:text-secondaryColor "
            >
              READ MORE <i className="icofont-double-right"></i>
            </Link>
          </div>
          <div className="text-primaryColor hover:text-secondaryColor space-y-1">
            <Link href="#">
              <i className="icofont-share bg-whitegrey1 dark:bg-whitegrey1-dark hover:text-whiteColor hover:bg-primaryColor w-8 h-7 leading-7 text-center inline-block rounded transition-all duration-300"></i>
            </Link>{" "}
            <Link href="#">
              <i className="icofont-heart bg-whitegrey1 dark:bg-whitegrey1-dark hover:text-whiteColor hover:bg-primaryColor w-8 h-7 leading-7 text-center inline-block rounded transition-all duration-300"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPrimary;
