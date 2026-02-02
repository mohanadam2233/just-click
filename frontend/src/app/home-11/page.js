import Home10 from "@/components/layout/main/Home10";
import Home11 from "@/components/layout/main/Home11";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Home 11 - Single Course | Edurock - Education LMS Template",
  description: "Home 11 - Single Course | Edurock - Education LMS Template",
};
const Home_11 = () => {
  return (
    <PageWrapper>
      <main>
        <Home11 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Home_11;
