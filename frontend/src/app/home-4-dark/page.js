import Home3 from "@/components/layout/main/Home3";
import Home4 from "@/components/layout/main/Home4";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Home-4 LMS Classic Dark | Edurock - Education LMS Template",
  description: "Home-4 LMS Classic Dark | Edurock - Education LMS Template",
};
const Home_4_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <Home4 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Home_4_Dark;
