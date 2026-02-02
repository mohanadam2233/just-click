import CourseDetails3Main from "@/components/layout/main/CourseDetails3Main";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Course Details 3 | Edurock - Education LMS Template",
  description: "Course Details 3 | Edurock - Education LMS Template",
};

const Course_Details_3 = async () => {
  return (
    <PageWrapper>
      <main>
        <CourseDetails3Main />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Course_Details_3;
