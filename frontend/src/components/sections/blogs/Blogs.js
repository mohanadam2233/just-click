"use client";
import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import SectionName from "@/components/shared/section-names/SectionName";
import Image from "next/image";
import blogImage1 from "@/assets/images/blog/blog_1.png";
import blogImage2 from "@/assets/images/blog/blog_2.png";
import blogImage3 from "@/assets/images/blog/blog_3.png";
import blogImage4 from "@/assets/images/blog/blog_4.png";
import blogImage26 from "@/assets/images/blog/blog_26.jpg";
import blogImage27 from "@/assets/images/blog/blog_27.jpg";
import blogImage28 from "@/assets/images/blog/blog_28.jpg";
import blogImage31 from "@/assets/images/blog/blog_31.jpg";
import blogImage32 from "@/assets/images/blog/blog_32.jpg";
import blogImage33 from "@/assets/images/blog/blog_33.jpg";
import Link from "next/link";
import allBlogs from "@/../public/fakedata/blogs.json";
import useIsTrue from "@/hooks/useIsTrue";
const Blogs = ({ secondary }) => {
  const isHome9 = useIsTrue("/home-9");
  const isHome9Dark = useIsTrue("/home-9-dark");
  const images = [
    secondary ? blogImage26 : isHome9 || isHome9Dark ? blogImage31 : blogImage1,
    secondary ? blogImage27 : isHome9 || isHome9Dark ? blogImage32 : blogImage3,
    secondary ? blogImage28 : isHome9 || isHome9Dark ? blogImage33 : blogImage4,
  ];
  const blogs = allBlogs.slice(0, 3);

  return (
    <section>
      <div className="container py-100px">
        {/*  heading  */}
        <div className="mb-5 md:mb-10" data-aos="fade-up">
          <div className="relative text-center">
            <div>
              <div>
                <SectionName>News & Blogs</SectionName>
              </div>
            </div>
            <HeadingPrimary>
              {" "}
              {isHome9 || isHome9Dark ? (
                <>
                  Our Latest{" "}
                  <span className="relative after:w-full after:h-[7px] z-0 after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5 after:z-[-1]">
                    Research
                  </span>
                </>
              ) : (
                "Leatest News & Blog"
              )}
            </HeadingPrimary>
          </div>
        </div>

        {/*  blogs  */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-30px">
          {blogs?.length &&
            blogs.map(
              ({ id, title, date, desc, image, author, month }, idx) =>
                idx === 0 && (
                  <div
                    key={idx}
                    className="lg:col-start-1 lg:col-span-8 group shadow-blog"
                    data-aos="fade-up"
                  >
                    {/*  blog thumbnail  */}
                    <div className="overflow-hidden relative">
                      <Image
                        src={images[idx]}
                        alt=""
                        className="w-full group-hover:scale-110 transition-all duration-300"
                        placeholder="blur"
                      />
                      <div className="text-base md:text-3xl leading-5 md:leading-9 font-semibold text-white px-15px py-5px md:px-6 md:py-2 bg-primaryColor rounded text-center absolute top-5 left-5">
                        {date} <br /> {month}
                      </div>
                    </div>
                    {/*  blog content  */}
                    <div className="p-5 md:p-35px md:pt-10">
                      <h3 className="text-2xl md:text-4xl leading-30px md:leading-45px font-bold text-blackColor hover:text-primaryColor pb-25px dark:text-blackColor-dark dark:hover:text-primaryColor">
                        <Link href={`blogs/${id}`}>{title}</Link>
                      </h3>
                      <p className="text-base text-contentColor dark:text-contentColor-dark mb-30px">
                        {desc}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11">
                            <Image
                              src={blogImage2}
                              alt=""
                              className="rounded-full"
                            />
                          </div>
                          <div className="text-sm md:text-lg text-darkdeep5 dark:text-darkdeep5-dark">
                            By:
                            <span className="text-blackColor dark:text-blackColor-dark">
                              {author?.name}
                            </span>
                          </div>
                        </div>
                        {/*  social  */}
                        <div>
                          <ul className="flex gap-1">
                            <li>
                              <a
                                href="#"
                                className="text-sm md:text-size-15 w-5 h-5 md:w-[39px] md:h-[39px] flex items-center justify-center border border-borderColor text-darkdeep4 hover:text-primaryColor dark:border-borderColor-dark rounded"
                              >
                                <i className="icofont-facebook"></i>
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="text-sm md:text-size-15 w-5 h-5 md:w-[39px] md:h-[39px] flex items-center justify-center border border-borderColor text-darkdeep4 hover:text-primaryColor dark:border-borderColor-dark rounded"
                              >
                                <i className="icofont-youtube-play"></i>
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="text-sm md:text-size-15 w-5 h-5 md:w-[39px] md:h-[39px] flex items-center justify-center border border-borderColor text-darkdeep4 hover:text-primaryColor dark:border-borderColor-dark rounded"
                              >
                                <i className="icofont-instagram"></i>
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="text-sm md:text-size-15 w-5 h-5 md:w-[39px] md:h-[39px] flex items-center justify-center border border-borderColor text-darkdeep4 hover:text-primaryColor dark:border-borderColor-dark rounded"
                              >
                                <i className="icofont-twitter"></i>
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}

          {/*  blog 2 & 3  */}

          <div className="lg:col-start-9 lg:col-span-4">
            <div className="flex flex-col gap-y-30px">
              {blogs?.length &&
                blogs.map(
                  ({ id, title, date, image, month }, idx) =>
                    idx > 0 &&
                    idx < 3 && (
                      <div
                        key={idx}
                        className="group shadow-blog"
                        data-aos="fade-up"
                      >
                        {/*  blog thumbnail  */}
                        <div className="overflow-hidden relative">
                          <Image
                            src={images[idx]}
                            alt=""
                            className="w-full  group-hover:scale-110 transition-all duration-300"
                            placeholder="blur"
                          />
                          <div className="text-base md:text-2xl leading-5 md:leading-30px font-semibold text-white px-15px py-5px md:px-22px md:py-7px bg-primaryColor rounded text-center absolute top-5 left-5">
                            {date} <br />
                            {month}
                          </div>
                        </div>
                        {/*  blog content  */}
                        <div className="px-5 py-25px">
                          <h3 className="text-2xl md:text-size-28 leading-30px md:leading-35px font-bold text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor">
                            <Link href={`blogs/${id}`}>{title}</Link>
                          </h3>
                        </div>
                      </div>
                    )
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blogs;
