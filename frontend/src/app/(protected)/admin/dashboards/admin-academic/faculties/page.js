import FacultiesMain from "@/components/layout/main/dashboards/academic/FacultiesMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Faculties | Admin Dashboard",
  description: "Manage faculties",
};

const FacultiesPage = () => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <FacultiesMain />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default FacultiesPage;
