import ContactMain from "@/components/layout/main/ContactMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Contact Dark | Edurock - Education LMS Template",
  description: "Contact Dark | Edurock - Education LMS Template",
};

const Contact_Dark = async () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <ContactMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Contact_Dark;
