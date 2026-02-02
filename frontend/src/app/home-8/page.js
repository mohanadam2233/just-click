import Home8 from "@/components/layout/main/Home8";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Home-8 e-Commerce | Edurock - Education LMS Template",
  description: "Home-8 e-Commerce | Edurock - Education LMS Template",
};
const Home_8 = () => {
  return (
    <PageWrapper>
      <main>
        <Home8 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Home_8;
