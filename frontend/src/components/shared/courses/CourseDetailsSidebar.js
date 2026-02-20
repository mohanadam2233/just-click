


import CourseEnroll from "../course-details/CourseEnroll";
import PopularCoursesMini from "../course-details/PopularCoursesMini";

const CourseDetailsSidebar = ({ type, course }) => {
  return (
    <div className="flex flex-col">
      {/* enroll section  */}
      <CourseEnroll type={type} course={course} />



      {/* popular course  */}
      <PopularCoursesMini />

    

    </div>
  );
};

export default CourseDetailsSidebar;
