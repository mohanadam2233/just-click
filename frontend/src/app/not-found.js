import ErrorMain from "@/components/layout/main/ErrorMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

const NotFound = () => {
  return (
    <PageWrapper>
      <main>
        <ErrorMain />
      </main>
      <ThemeController />
    </PageWrapper>
  );
};

export default NotFound;
