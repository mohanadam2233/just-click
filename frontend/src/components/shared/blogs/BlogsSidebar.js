import React from "react";
import BlogAuthor from "./BlogAuthor";
import BlogCategories from "./BlogCategories";
import RecentPosts from "./RecentPosts";
import ImageGallery from "@/components/sections/sub-section/ImageGallery";
import BlogContactForm from "./BlogContactForm";
import BlogTags from "./BlogTags";
import BlogSocials from "./BlogSocials";
import BlogSearch from "./BlogSearch";

const BlogsSidebar = () => {
  return (
    <div className="flex flex-col">
      {/* author details */}
      <BlogAuthor />
      {/* search input */}
      <BlogSearch />
      {/* categories */}
      <BlogCategories />
      {/* recent posts */}
      <RecentPosts />
      {/* photo gallary */}
      <div
        className="p-5 md:p-30px lg:p-5 2xl:p-30px mb-30px border border-borderColor2 dark:border-borderColor2-dark"
        data-aos="fade-up"
      >
        <h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold pl-2 before:w-0.5 relative before:h-[21px] before:bg-primaryColor before:absolute before:bottom-[5px] before:left-0 leading-30px mb-25px">
          Photo Gallery
        </h4>
        <ImageGallery gallary={"mini"} />
      </div>
      {/* contact form */}
      <BlogContactForm />
      {/* tags */}
      <BlogTags />
      {/* social area */}
      <BlogSocials />
    </div>
  );
};

export default BlogsSidebar;
