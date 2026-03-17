import StudentOnboardingDetailMain from "@/components/layout/main/dashboards/academic/StudentOnboardingDetailMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Student Onboarding Details | Admin Dashboard",
  description: "View and manage pending student onboarding",
};

const StudentOnboardingDetailPage = ({ params }) => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <StudentOnboardingDetailMain id={params.id} />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default StudentOnboardingDetailPage;
