import Image from "next/image";
import Link from "next/link";

const Blog = ({ blog }) => {
  const { title, image, pulishDate, id } = blog;
  return (
    <div data-aos="fade-up" className="shadow-dropdown-secodary bg-transparent">
      <div className="relative group p-10px">
        <Image src={image} alt="" className="w-full" />
        {/* social icons  */}
        <div className="absolute left-[30px] bottom-[30px]">
          <Link
            href={`/blogs/${id}`}
            className="px-12 py-10px text-size-15 leading-1 text-whiteColor bg-blackColor border border-blackColor hover:text-blackColor hover:bg-whiteColor rounded-full dark:text-whiteColor-dark dark:bg-blackColor-dark dark:hover:text-blackColor-dark dark:hover:bg-whiteColor-dark dark:border-blackColor-dark"
          >
            Story
          </Link>
        </div>
      </div>
      <div className="pt-30px pr-5 pb-10 pl-30px md:py-5 md:px-10 lg:pt-30px lg:pr-10px lg:pb-10 lg:pl-5 2xl:pt-30px 2xl:pr-5 2xl:pb-10 2xl:pl-30px">
        <p className="text-base text-primaryColor uppercase font-bold mb-15px">
          {pulishDate}
        </p>
        <h5>
          <Link
            href={`/blogs/${id}`}
            className="text-2xl md:text-xl 2xl:text-2xl leading-8 md:leading-7 2xl:leading-8 font-bold text-blackColor dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor mb-15px"
          >
            {title}
          </Link>
        </h5>
        <Link
          href={`/blogs/${id}`}
          className="text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor"
        >
          Read More <i className="icofont-long-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default Blog;
