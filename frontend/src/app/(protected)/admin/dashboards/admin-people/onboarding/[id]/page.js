import OnboardingDetailMain from "@/components/layout/main/dashboards/people/OnboardingDetailMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Onboarding Details | Admin Dashboard",
  description: "View onboarding details",
};

const OnboardingDetailPage = ({ params }) => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <OnboardingDetailMain id={params.id} />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default OnboardingDetailPage;
