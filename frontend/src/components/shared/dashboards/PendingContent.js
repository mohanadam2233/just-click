import CourseCard from "../courses/CourseCard";

const PendingContent = ({ courses }) => {
  return courses?.map((course, idx) => (
    <CourseCard key={idx} course={course} type={"primary"} />
  ));
};

export default PendingContent;
