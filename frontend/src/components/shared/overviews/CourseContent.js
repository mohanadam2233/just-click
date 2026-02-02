import getAllCourses from "@/libs/getAllCourses";
import CourseCard2 from "../courses/CourseCard2";

const CourseContent = ({ isNotSidebar }) => {
  const allCourses = getAllCourses();
  const courses = allCourses.slice(0, 3);

  return (
    <div className="flex flex-col gap-30px">
      {courses?.length &&
        courses.map((course, idx) => (
          <CourseCard2
            isNotSidebar={isNotSidebar}
            key={idx}
            idx={idx}
            course={course}
          />
        ))}
    </div>
  );
};

export default CourseContent;
