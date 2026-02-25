import CourseCard from "../courses/CourseCard";
const PublishContent = ({ courses }) => {
  return courses?.map((course, idx) => (
    <CourseCard key={idx} course={course} type={"primary"} />
  ));
};

export default PublishContent;
