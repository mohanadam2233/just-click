import StudentOnboardingMain from "@/components/layout/main/dashboards/academic/StudentOnboardingMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Student Onboarding Queue | Admin Dashboard",
  description: "Manage pending student registrations and approvals",
};

const StudentOnboardingPage = () => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <StudentOnboardingMain />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default StudentOnboardingPage;
