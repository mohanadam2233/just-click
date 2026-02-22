import AdminAcademicMaterialsMain from "@/components/layout/main/dashboards/AdminAcademicMaterialsMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
export const metadata = {
  title: "Admin Dashboard | Edurock - Education LMS Template",
  description: "Admin Dashboard | Edurock - Education LMS Template",
};
const admin_academic_materials = () => {
  return (
    <PageWrapper>
      <main>
        <DsahboardWrapper>
          <DashboardContainer>
            <AdminAcademicMaterialsMain />
          </DashboardContainer>
        </DsahboardWrapper>
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default admin_academic_materials;
