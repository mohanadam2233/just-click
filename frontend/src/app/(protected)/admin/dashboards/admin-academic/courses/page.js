import CoursesMain from "@/components/layout/main/dashboards/academic/CoursesMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Courses | Admin Dashboard",
  description: "Manage university courses",
};

const CoursesPage = () => {
  return (
    <main>
      <DsahboardWrapper>
        <DashboardContainer>
          <CoursesMain />
        </DashboardContainer>
      </DsahboardWrapper>
      <ThemeController />
    </main>
  );
};

export default CoursesPage;
