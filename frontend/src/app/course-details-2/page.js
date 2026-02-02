import CourseDetails2Main from "@/components/layout/main/CourseDetails2Main";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Courses Details 2 | Edurock - Education LMS Template",
  description: "Courses Details 2 | Edurock - Education LMS Template",
};

const Course_Details_2 = async () => {
  return (
    <PageWrapper>
      <main>
        <CourseDetails2Main />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Course_Details_2;
