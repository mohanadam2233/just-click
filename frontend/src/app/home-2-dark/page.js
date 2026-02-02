import Home2 from "@/components/layout/main/Home2";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import React from "react";
export const metadata = {
  title: "Home 2 Dark | Edurock - Education LMS Template",
  description: "Home 2 Dark | Edurock - Education LMS Template",
};
const Home_2_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <Home2 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Home_2_Dark;
