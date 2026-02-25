import Home3 from "@/components/layout/main/Home3";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      <main>
        <Home3 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
}
