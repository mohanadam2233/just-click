import CourseDetails2Main from "@/components/layout/main/CourseDetails2Main";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import React from "react";
export const metadata = {
  title: "Courses Details 2 - Dark | Edurock - Education LMS Template",
  description: "Courses Details 2 - Dark | Edurock - Education LMS Template",
};
const Course_Details_2_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <CourseDetails2Main />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Course_Details_2_Dark;
