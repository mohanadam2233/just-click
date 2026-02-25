import LoginMain from "@/components/layout/main/LoginMain";
import SignupMain from "@/components/layout/main/SignupMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Login | Edurock - Education LMS Template",
  description: "Login | Edurock - Education LMS Template",
};

const Signup = () => {
  return (

      <main>
        <SignupMain />
        <ThemeController />
      </main>
 
  );
};

export default Signup;
