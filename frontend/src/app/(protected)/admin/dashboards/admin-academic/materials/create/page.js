import CreateMaterialMain from "@/components/layout/main/dashboards/academic/CreateMaterialMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "New Material | Admin Dashboard",
  description: "Create a new course material",
};

const CreateMaterialPage = () => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <CreateMaterialMain />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default CreateMaterialPage;
