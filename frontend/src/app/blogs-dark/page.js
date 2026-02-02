import BlogsMain from "@/components/layout/main/BlogsMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import React from "react";
export const metadata = {
  title: "Blog - Dark | Edurock - Education LMS Template",
  description: "Blog - Dark | Edurock - Education LMS Template",
};
const Blog_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <BlogsMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Blog_Dark;
