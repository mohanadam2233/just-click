import Home3 from "@/components/layout/main/Home3";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import React from "react";
export const metadata = {
  title: "Home-3 | Edurock - Education LMS Template",
  description: "Home-3 | Edurock - Education LMS Template",
};
const Home_3 = () => {
  return (
    <PageWrapper>
      <main>
        <Home3 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Home_3;
