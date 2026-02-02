import BlogsPrimary from "@/components/sections/blogs/BlogsPrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import React from "react";

const BlogsMain = () => {
  return (
    <>
      <HeroPrimary title={"Blog Page"} path={"Blog Page"} />
      <BlogsPrimary />
    </>
  );
};

export default BlogsMain;
