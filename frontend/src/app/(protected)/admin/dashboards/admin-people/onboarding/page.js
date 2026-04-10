import OnboardingMain from "@/components/layout/main/dashboards/people/OnboardingMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Onboarding Queue | Admin Dashboard",
  description: "Manage onboarding queue",
};

const OnboardingPage = () => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <OnboardingMain />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default OnboardingPage;
