import DepartmentDetailMain from "@/components/layout/main/dashboards/academic/DepartmentDetailMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Department Details | Admin Dashboard",
  description: "View and edit department",
};

const DepartmentDetailPage = ({ params }) => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <DepartmentDetailMain id={params.id} />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default DepartmentDetailPage;
