import FacultyDetailMain from "@/components/layout/main/dashboards/academic/FacultyDetailMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Faculty Details | Admin Dashboard",
  description: "View and edit faculty",
};

const FacultyDetailPage = ({ params }) => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <FacultyDetailMain id={params.id} />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default FacultyDetailPage;
