import InstructorMain from "@/components/layout/main/InstructorMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Instructor - Dark | Edurock - Education LMS Template",
  description: "Instructor - Dark | Edurock - Education LMS Template",
};
const Instructors_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <InstructorMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Instructors_Dark;
