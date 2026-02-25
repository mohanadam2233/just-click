import CourseDetailsMain from "@/components/layout/main/CourseDetailsMain";
import ThemeController from "@/components/shared/others/ThemeController";


export const metadata = {
  title: "Courses Details 2 | Edurock - Education LMS Template",
  description: "Courses Details 2 | Edurock - Education LMS Template",
};

const Course_Details = async () => {
  return (
 
      <main>
        <CourseDetailsMain />
        <ThemeController />
      </main>
 
  );
};

export default Course_Details;
