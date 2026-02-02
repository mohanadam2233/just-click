"use client";
import allBlogs from "@/../public/fakedata/blogs";
import blogImag6 from "@/assets/images/blog/blog_6.png";
import blogImag7 from "@/assets/images/blog/blog_7.png";
import blogImag8 from "@/assets/images/blog/blog_8.png";
import blogImag9 from "@/assets/images/blog/blog_9.png";
import BlogPrimary from "@/components/shared/blogs/BlogPrimary";
import BlogsSidebar from "@/components/shared/blogs/BlogsSidebar";
import Pagination from "@/components/shared/others/Pagination";
import { useEffect, useRef, useState } from "react";
const images = [
  blogImag6,
  blogImag7,
  blogImag8,
  blogImag9,
  blogImag8,
  blogImag7,
  blogImag6,
  blogImag9,
  blogImag6,
  blogImag7,
];
const BlogsPrimary = () => {
  const [currentBlogs, setCurrentBlogs] = useState(null);
  const blogsRef = useRef(null);
  const [skip, setSkip] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const totalBlogs = allBlogs?.length;
  const limit = 4;
  const totalPages = Math.ceil(totalBlogs / limit);
  const paginationItems = [...Array(totalPages)];

  const handlePagesnation = (id) => {
    blogsRef.current.scrollIntoView({ behavior: "smooth" });
    if (typeof id === "number") {
      setCurrentPage(id);

      setSkip(limit * id);
    } else if (id === "prev") {
      setCurrentPage(currentPage - 1);
      setSkip(skip - limit);
    } else if (id === "next") {
      setCurrentPage(currentPage + 1);
      setSkip(skip + limit);
    }
  };

  useEffect(() => {
    const blogs = [...allBlogs.slice(6, 10), ...allBlogs.slice(0, 6)]?.map(
      (blog, idx) => ({
        ...blog,
        image: images[idx],
      })
    );
    const blogsToShow = [...blogs].splice(skip, limit);
    setCurrentBlogs(blogsToShow);
  }, [skip, limit]);

  return (
    <section ref={blogsRef}>
      <div className="container py-10 md:py-50px lg:py-60px 2xl:py-100px">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-30px">
          {/* blogs */}
          <div className="lg:col-start-1 lg:col-span-8 space-y-[35px]">
            {currentBlogs && (
              <>
                {" "}
                {currentBlogs?.map((blog, idx) => (
                  <BlogPrimary blog={blog} idx={idx} key={idx} />
                ))}
                {/* pagination */}
                <Pagination
                  pages={paginationItems}
                  totalItems={totalBlogs}
                  handlePagesnation={handlePagesnation}
                  currentPage={currentPage}
                  skip={skip}
                  limit={limit}
                />
              </>
            )}
          </div>
          {/* blog sidebar */}
          <div className="lg:col-start-9 lg:col-span-4">
            <BlogsSidebar />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogsPrimary;
