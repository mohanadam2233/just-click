import Link from "next/link";

const BlogSocials2 = () => {
  return (
    <div>
      <ul className="flex gap-10px justify-center items-center">
        <li>
          <p className="text-lg md:text-size-22 leading-7 md:leading-30px text-blackColor dark:text-blackColor-dark font-bold">
            Share
          </p>
        </li>
        <li>
          <Link
            href="https://x.com/"
            className="h-35px w-35px leading-35px md:w-38px md:h-38px md:leading-38px text-size-11 md:text-xs text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
          >
            <i className="icofont-twitter"></i>
          </Link>
        </li>
        <li>
          <Link
            href="https://www.facebook.com/"
            className="h-35px w-35px leading-35px md:w-38px md:h-38px md:leading-38px text-size-11 md:text-xs text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
          >
            <i className="icofont-facebook"></i>
          </Link>
        </li>

        <li>
          <Link
            href="https://www.instagram.com/"
            className="h-35px w-35px leading-35px md:w-38px md:h-38px md:leading-38px text-size-11 md:text-xs text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
          >
            <i className="icofont-instagram"></i>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default BlogSocials2;
