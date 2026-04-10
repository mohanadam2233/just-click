import StaffMain from "@/components/layout/main/dashboards/people/StaffMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Staff | Admin Dashboard",
  description: "Manage staff members",
};

const StaffPage = () => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <StaffMain />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default StaffPage;
