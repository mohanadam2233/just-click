import LoginMain from "@/components/layout/main/LoginMain";
import ThemeController from "@/components/shared/others/ThemeController";


export const metadata = {
  title: "Login | Edurock - Education LMS Template",
  description: "Login | Edurock - Education LMS Template",
};
const Login = () => {
  return (
    
      <main>
        <LoginMain />
        <ThemeController />
      </main>
    
  );
};

export default Login;
