import StaffDetailMain from "@/components/layout/main/dashboards/people/StaffDetailMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Staff Details | Admin Dashboard",
  description: "View staff details",
};

const StaffDetailPage = ({ params }) => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <StaffDetailMain id={params.id} />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default StaffDetailPage;
