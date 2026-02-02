"use client";
import HeadingPrimaryXl from "@/components/shared/headings/HeadingPrimaryXl ";
import SectionNameSecondary from "@/components/shared/section-names/SectionNameSecondary";
import React from "react";
import allBlogs from "@/../public/fakedata/blogs.json";
import blogImage5 from "@/assets/images/blog/blog_5.png";
import blogImage24 from "@/assets/images/blog/blog_24.png";
import blogImage25 from "@/assets/images/blog/blog_25.png";
import blogImage34 from "@/assets/images/blog/blog_34.jpg";
import blogImage35 from "@/assets/images/blog/blog_35.jpg";
import blogImage36 from "@/assets/images/blog/blog_36.jpg";
import Blog from "@/components/shared/blogs/Blog";
import Link from "next/link";
import useIsTrue from "@/hooks/useIsTrue";
const Blogs2 = () => {
  const isHome10 = useIsTrue("/home-10");
  const isHome10Dark = useIsTrue("/home-10-dark");
  const blogs = allBlogs.slice(3, 6);
  const images =
    isHome10 || isHome10Dark
      ? [blogImage34, blogImage35, blogImage36]
      : [blogImage5, blogImage24, blogImage25];
  return (
    <section>
      <div className="container py-10 md:py-50px lg:py-60px 2xl:py-100px">
        {/* heading  */}

        <div data-aos="fade-up" className="text-center mb-15px">
          <SectionNameSecondary>NEWS & BLOG</SectionNameSecondary>
          <HeadingPrimaryXl>Latest News & Blogs</HeadingPrimaryXl>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-30px">
          {/* blogs  */}

          {blogs.map((blog, idx) => (
            <Blog key={idx} blog={{ ...blog, image: images[idx] }} />
          ))}
        </div>

        <div className="flex justify-center" data-aos="fade-up">
          <Link
            href="/blogs"
            className="text-size-15 px-47px py-15px bg-primaryColor text-whiteColor border border-primaryColor hover:text-primaryColor hover:bg-whiteColor dark:hover:bg-whiteColor-dark dark:hover:text-whiteColor mt-10 md:mt-50px rounded uppercase"
          >
            More Blog
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blogs2;
