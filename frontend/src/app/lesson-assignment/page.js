import LessonAssignmentMain from "@/components/layout/main/LessonAssignmentMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Lesson Assignment | Edurock - Education LMS Template",
  description: "Lesson Assignment | Edurock - Education LMS Template",
};
const Lesson_Assignment = () => {
  return (
    <PageWrapper>
      <main>
        <LessonAssignmentMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Lesson_Assignment;
