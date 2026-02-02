import LoginMain from "@/components/layout/main/LoginMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Login/Register - Dark | Edurock - Education LMS Template",
  description: "Login/Register - Dark | Edurock - Education LMS Template",
};
const Login_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <LoginMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Login_Dark;
