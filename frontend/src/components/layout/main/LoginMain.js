import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import LoginTab from "@/components/sections/login/LoginTab";

const LoginMain = () => {
  return (
    <>
      <HeroPrimary path={"Log In"} title={"Log In"} />
      <LoginTab />
    </>
  );
};

export default LoginMain;
