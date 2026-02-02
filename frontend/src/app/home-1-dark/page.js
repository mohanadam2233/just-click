import Home1 from "@/components/layout/main/Home1";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import React from "react";
export const metadata = {
  title: "Home 1 Dark | Edurock - Education LMS Template",
};
const Home1Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <ThemeController />
        <Home1 />
      </main>
    </PageWrapper>
  );
};

export default Home1Dark;
