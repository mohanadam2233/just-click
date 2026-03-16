import CreateCourseMain from "@/components/layout/main/dashboards/academic/CreateCourseMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Create Course | Admin Dashboard",
  description: "Create course",
};

const CreateCoursePage = () => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <CreateCourseMain />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default CreateCoursePage;
