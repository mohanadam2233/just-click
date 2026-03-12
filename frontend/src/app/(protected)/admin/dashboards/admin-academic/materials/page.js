import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import MaterialsMain from "@/components/layout/main/dashboards/academic/MaterialsMain";

export const metadata = {
  title: "Materials | Admin Dashboard",
  description: "Manage academic materials",
};

const MaterialsPage = () => {
  return (
    <main>
      <DsahboardWrapper>
        <DashboardContainer>
          <MaterialsMain />
        </DashboardContainer>
      </DsahboardWrapper>
      <ThemeController />
    </main>
  );
};

export default MaterialsPage;
