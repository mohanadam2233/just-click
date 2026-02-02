import blogImage11 from "@/assets/images/blog/blog_11.png";
import blogImage12 from "@/assets/images/blog/blog_12.png";
import blogImage13 from "@/assets/images/blog/blog_13.png";
import blogImage14 from "@/assets/images/blog/blog_14.png";
import Image from "next/image";
import Link from "next/link";
const RecentPosts = () => {
  const posts = [
    {
      id: 1,
      title: "Show at the University",
      image: blogImage11,
      date: "01 23 December 2024",
    },
    {
      id: 2,
      title: "Show at the University",
      image: blogImage12,
      date: "01 23 December 2024",
    },
    {
      id: 3,
      title: "Show at the University",
      image: blogImage13,
      date: "01 23 December 2024",
    },
    {
      id: 4,
      title: "Show at the University",
      image: blogImage14,
      date: "01 23 December 2024",
    },
  ];
  return (
    <div
      className="p-5 md:p-30px lg:p-5 2xl:p-30px mb-30px border border-borderColor2 dark:border-borderColor2-dark"
      data-aos="fade-up"
    >
      <h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold pl-2 before:w-0.5 relative before:h-[21px] before:bg-primaryColor before:absolute before:bottom-[5px] before:left-0 leading-30px mb-25px">
        Recent Post
      </h4>
      <ul className="flex flex-col gap-y-25px">
        {posts?.map(({ date, image, id, title }, idx) => (
          <li className="flex items-center" key={idx}>
            <div className="w-2/5 pr-5 relative">
              <Link href={`blogs/${id}`} className="w-full">
                <Image src={image} alt="" className="w-full" />
              </Link>
              <span className="text-xs font-medium text-whiteColor h-6 w-6 leading-6 text-center bg-primaryColor absolute top-0 left-0">
                {idx < 10 ? `0${idx + 1}` : idx + 1}
              </span>
            </div>
            <div className="w-3/5">
              <Link
                href={`blogs/${id}`}
                className="w-full text-sm text-contentColor font-medium leading-7 dark:text-contentColor-dark hover:text-primaryColor dark:hover:text-primaryColor"
              >
                {date}
              </Link>
              <h3 className="font-bold leading-22px mb-15px">
                <Link
                  className="text-blackColor dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor"
                  href={`blogs/${id}`}
                >
                  {title}
                </Link>
              </h3>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentPosts;
