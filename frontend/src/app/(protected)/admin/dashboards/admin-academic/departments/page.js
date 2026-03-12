import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import DepartmentsMain from "@/components/layout/main/dashboards/academic/DepartmentsMain";

export const metadata = {
  title: "Departments | Admin Dashboard",
  description: "Manage university departments",
};

const DepartmentsPage = () => {
  return (
    <main>
      <DsahboardWrapper>
        <DashboardContainer>
          <DepartmentsMain />
        </DashboardContainer>
      </DsahboardWrapper>
      <ThemeController />
    </main>
  );
};

export default DepartmentsPage;
