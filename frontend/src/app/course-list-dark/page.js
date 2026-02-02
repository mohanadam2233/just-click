import CourseListMain from "@/components/layout/main/CourseListMain";

import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
export const metadata = {
  title: "Course List - Dark | Edurock - Education LMS Template",
  description: "Course List - Dark | Edurock - Education LMS Template",
};
const Course_List_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <CourseListMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Course_List_Dark;
