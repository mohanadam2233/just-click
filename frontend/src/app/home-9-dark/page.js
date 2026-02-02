import Home9 from "@/components/layout/main/Home9";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Home-9 Kindergarten - Dark | Edurock - Education LMS Template",
  description: "Home-9 Kindergarten - Dark | Edurock - Education LMS Template",
};
const Home_9_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <Home9 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Home_9_Dark;
