import Home10 from "@/components/layout/main/Home10";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Home-10 AI Machine Learning | Edurock - Education LMS Template",
  description: "Home-10 AI Machine Learning | Edurock - Education LMS Template",
};
const Home_10 = () => {
  return (
    <PageWrapper>
      <main>
        <Home10 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Home_10;
