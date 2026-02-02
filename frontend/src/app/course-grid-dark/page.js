import CourseGridMain from "@/components/layout/main/CourseGridMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
export const metadata = {
  title: "Course Grid - Dark | Edurock - Education LMS Template",
  description: "Course Grid - Dark | Edurock - Education LMS Template",
};
const Course_Grid_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <CourseGridMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Course_Grid_Dark;
