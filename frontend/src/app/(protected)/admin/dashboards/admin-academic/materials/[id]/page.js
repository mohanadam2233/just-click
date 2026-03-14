import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import MaterialDetailMain from "@/components/layout/main/dashboards/academic/MaterialDetailMain";

export const metadata = {
  title: "Material Details | Admin Dashboard",
  description: "View and edit course material",
};

const MaterialDetailPage = ({ params }) => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <MaterialDetailMain id={params.id} />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default MaterialDetailPage;
