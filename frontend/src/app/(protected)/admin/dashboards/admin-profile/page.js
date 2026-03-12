import AdminProfileMain from "@/components/layout/main/dashboards/AdminProfileMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";

import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
export const metadata = {
  title: "Admin Profile | Edurock - Education LMS Template",
  description: "Admin Profile | Edurock - Education LMS Template",
};
const Admin_Profile = () => {
  return (
    <main>
      <DsahboardWrapper>
        <DashboardContainer>
          <AdminProfileMain />
        </DashboardContainer>
      </DsahboardWrapper>
      <ThemeController />
    </main>
  );
};

export default Admin_Profile;
