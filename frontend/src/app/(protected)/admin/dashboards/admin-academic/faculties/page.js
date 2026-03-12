import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import FacultiesMain from "@/components/layout/main/dashboards/academic/FacultiesMain";

export const metadata = {
  title: "Faculties | Admin Dashboard",
  description: "Manage university faculties",
};

const FacultiesPage = () => {
  return (
    <main>
      <DsahboardWrapper>
        <DashboardContainer>
          <FacultiesMain />
        </DashboardContainer>
      </DsahboardWrapper>
      <ThemeController />
    </main>
  );
};

export default FacultiesPage;
