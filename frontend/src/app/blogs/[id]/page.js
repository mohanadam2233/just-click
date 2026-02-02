import BlogDetailsMain from "@/components/layout/main/BlogDetailsMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import blogs from "@/../public/fakedata/blogs.json";
import { notFound } from "next/navigation";
export const metadata = {
  title: "Blog Details | Edurock - Education LMS Template",
  description: "Blog Details | Edurock - Education LMS Template",
};

const Blog_details = async ({ params }) => {
  const { id } = params;
  const isExistBlog = blogs?.find(({ id: id1 }) => id1 === parseInt(id));
  if (!isExistBlog) {
    notFound();
  }
  return (
    <PageWrapper>
      <main>
        <BlogDetailsMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};
export async function generateStaticParams() {
  return blogs?.map(({ id }) => ({ id: id.toString() }));
}
export default Blog_details;
