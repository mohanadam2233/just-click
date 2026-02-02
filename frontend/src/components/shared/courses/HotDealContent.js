import CourseCard from "./CourseCard";

const HotDealContent = ({ courses }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg::grid-cols-3 xl:grid-cols-4 -mx-15px">
      {courses?.length ? (
        courses?.map((course, idx) => (
          <CourseCard key={idx} course={course} type={"primary"} />
        ))
      ) : (
        <span></span>
      )}
    </div>
  );
};

export default HotDealContent;
