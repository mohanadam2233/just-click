import CreateDepartmentMain from "@/components/layout/main/dashboards/academic/CreateDepartmentMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Create Department | Admin Dashboard",
  description: "Create department",
};

const CreateDepartmentPage = () => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <CreateDepartmentMain />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default CreateDepartmentPage;
