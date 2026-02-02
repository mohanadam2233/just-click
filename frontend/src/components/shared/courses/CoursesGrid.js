import CourseCard from "./CourseCard";

const CoursesGrid = ({ courses, isNotSidebar }) => {
  return (
    <div
      className={`grid grid-cols-1 ${
        isNotSidebar
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      }   gap-30px`}
    >
      {courses?.length ? (
        courses?.map((course, idx) => (
          <CourseCard key={idx} course={course} type={"primaryMd"} />
        ))
      ) : (
        <span></span>
      )}
    </div>
  );
};

export default CoursesGrid;
