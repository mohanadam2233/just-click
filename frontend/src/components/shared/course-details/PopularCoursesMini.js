import Image from "next/image";
import courseDetailsImage6 from "@/assets/images/blog-details/blog-details__6.png";
import courseDetailsImage7 from "@/assets/images/blog-details/blog-details__7.png";
import courseDetailsImage8 from "@/assets/images/blog-details/blog-details__8.png";
import Link from "next/link";
// import courseDetailsImage9 from "@/assets/images/blog-details/blog-details__9.png";

const PopularCoursesMini = () => {
  return (
    <div
      className="p-5 md:p-30px lg:p-5 2xl:p-30px mb-30px border border-borderColor2 dark:border-borderColor2-dark"
      data-aos="fade-up"
    >
      <h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold pl-2 before:w-0.5 relative before:h-[21px] before:bg-primaryColor before:absolute before:bottom-[5px] before:left-0 leading-30px mb-25px">
        Populer Course
      </h4>
      <ul className="flex flex-col gap-y-25px">
        <li className="flex items-center">
          <div className="w-[91px] h-auto mr-5 flex-shrink-0">
            <Link href="/courses/1" className="w-full">
              <Image src={courseDetailsImage6} alt="" className="w-full" />
            </Link>
          </div>
          <div className="flex-grow">
            <h3 className="text-sm text-primaryColor font-medium leading-[17px]">
              $32,000
            </h3>
            <Link
              href="/courses/1"
              className="text-blackColor dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor font-semibold leading-22px"
            >
              Making Music with Other People
            </Link>
          </div>
        </li>
        <li className="flex items-center">
          <div className="w-[91px] h-auto mr-5 flex-shrink-0">
            <Link href="/courses/2" className="w-full">
              <Image src={courseDetailsImage7} alt="" className="w-full" />
            </Link>
          </div>
          <div className="flex-grow">
            <h3 className="text-sm text-primaryColor font-medium leading-[17px]">
              $32,000
            </h3>
            <Link
              href="/courses/2"
              className="text-blackColor dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor font-semibold leading-22px"
            >
              Making Music with Other People
            </Link>
          </div>
        </li>
        <li className="flex items-center">
          <div className="w-[91px] h-auto mr-5 flex-shrink-0">
            <Link href="/courses/3" className="w-full">
              <Image src={courseDetailsImage8} alt="" className="w-full" />
            </Link>
          </div>
          <div className="flex-grow">
            <h3 className="text-sm text-primaryColor font-medium leading-[17px]">
              $32,000
            </h3>
            <Link
              href="/courses/3"
              className="text-blackColor dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor font-semibold leading-22px"
            >
              Making Music with Other People
            </Link>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default PopularCoursesMini;
