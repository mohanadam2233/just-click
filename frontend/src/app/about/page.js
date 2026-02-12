import AboutMain from "@/components/layout/main/AboutMain";

import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "About | Edurock - Education LMS Template",
  description: "About | Edurock - Education LMS Template",
};

const About = async () => {
  return (
    <PageWrapper>
      <main>
        <AboutMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default About;
