import StudentsMain from "@/components/layout/main/dashboards/people/StudentsMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Students | Admin Dashboard",
  description: "Manage students",
};

const StudentsPage = () => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <StudentsMain />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default StudentsPage;
