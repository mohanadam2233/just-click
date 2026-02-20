import LoginMain from "@/components/layout/main/LoginMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Login | Edurock - Education LMS Template",
  description: "Login | Edurock - Education LMS Template",
};
const Login = () => {
  return (
    <PageWrapper>
      <main>
        <LoginMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Login;
