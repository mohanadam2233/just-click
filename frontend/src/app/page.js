import Home1 from "@/components/layout/main/Home1";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      <main>
        <Home1 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
}
