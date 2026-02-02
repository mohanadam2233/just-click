import React from "react";
import BlogTags2 from "./BlogTags2";
import BlogSocials2 from "./BlogSocials2";

const BlogTagsAndSocila = () => {
  return (
    <div className="flex justify-between items-center flex-wrap py-10 mb-10 border-y border-borderColor2 dark:border-borderColor2-dark gap-y-10px">
      <BlogTags2 />
      <div>
        {/* social */}
        <BlogSocials2 />
      </div>
    </div>
  );
};

export default BlogTagsAndSocila;
