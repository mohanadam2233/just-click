import CourseDetailsMain from "@/components/layout/main/CourseDetailsMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Courses Details 2 | Edurock - Education LMS Template",
  description: "Courses Details 2 | Edurock - Education LMS Template",
};

const Course_Details = async () => {
  return (
    <PageWrapper>
      <main>
        <CourseDetailsMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Course_Details;
