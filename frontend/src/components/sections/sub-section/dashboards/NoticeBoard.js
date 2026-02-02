import allBlogs from "@/../public/fakedata/blogs.json";
import blogImage4 from "@/assets/images/blog/blog_4.png";
import blogImage6 from "@/assets/images/blog/blog_6.png";
import blogImage7 from "@/assets/images/blog/blog_7.png";
import blogImage8 from "@/assets/images/blog/blog_8.png";
import blogImage9 from "@/assets/images/blog/blog_9.png";
import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
import Image from "next/image";
import Link from "next/link";
const NoticeBoard = () => {
  const blogs = allBlogs?.slice(0, 5);
  const images = [blogImage4, blogImage6, blogImage7, blogImage8, blogImage9];
  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5 max-h-137.5 overflow-auto">
      <HeadingDashboard path={"/blogs"}>Notice Board</HeadingDashboard>

      {/* instrutor */}
      <ul>
        {blogs?.map(({ id, title }, idx) => (
          <li key={idx} className="flex items-center flex-wrap pt-5">
            {/* avatar */}
            <div className="w-full md:w-30% md:pr-5">
              <Link className="w-full" href="/blogs/1">
                <Image src={images[idx]} alt="" className="w-full" />
              </Link>
            </div>
            {/* details */}
            <div className="w-full md:w-70% md:pr-5">
              <div>
                <h5 className="text-lg leading-1.5 font-medium text-contentColor dark:text-contentColor-dark mb-5px">
                  <Link className="hover:text-primaryColor" href="/blogs/1">
                    {title}
                  </Link>
                </h5>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoticeBoard;
