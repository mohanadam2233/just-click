import BlogContactForm from "../blogs/BlogContactForm";
import BlogSocials from "../blogs/BlogSocials";
import BlogTags from "../blogs/BlogTags";
import CourseEnroll from "../course-details/CourseEnroll";
import PopularCoursesMini from "../course-details/PopularCoursesMini";

const CourseDetailsSidebar = ({ type, course }) => {
  return (
    <div className="flex flex-col">
      {/* enroll section  */}
      <CourseEnroll type={type} course={course} />

      {/* social area  */}
      <BlogSocials />

      {/* popular course  */}
      <PopularCoursesMini />

      {/* contact form  */}
      <BlogContactForm />

      {/* tags */}
      <BlogTags />
    </div>
  );
};

export default CourseDetailsSidebar;
