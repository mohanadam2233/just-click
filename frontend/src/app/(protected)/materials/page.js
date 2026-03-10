import CoursesMain from "@/components/layout/main/CoursesMain";

import ThemeController from "@/components/shared/others/ThemeController";

export const metadata = {
  title: "Material list | CMCP",
  description: "Material list | CMCP system",
};

const Courses = async () => {
  return (
    <main>
      <CoursesMain />
      <ThemeController />
    </main>
  );
};

export default Courses;
