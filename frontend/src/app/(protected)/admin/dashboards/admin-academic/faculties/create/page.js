import CreateFacultyMain from "@/components/layout/main/dashboards/academic/CreateFacultyMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Create Faculty | Admin Dashboard",
  description: "Create faculty",
};

const CreateFacultyPage = () => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <CreateFacultyMain />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default CreateFacultyPage;
