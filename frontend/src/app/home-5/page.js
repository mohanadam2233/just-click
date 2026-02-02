import Home5 from "@/components/layout/main/Home5";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Home-5 Online Course | Edurock - Education LMS Template",
  description: "Home-5 Online Course | Edurock - Education LMS Template",
};
const Home_5 = () => {
  return (
    <PageWrapper>
      <main>
        <Home5 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Home_5;
