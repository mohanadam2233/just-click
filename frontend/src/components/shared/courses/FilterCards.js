import CourseCard from "./CourseCard";
import getAllCourses from "@/libs/getAllCourses";

const FilterCards = ({ type }) => {
  const allCourses = getAllCourses();
  const courses =
    type === "lg" ? allCourses?.slice(0, 8) : allCourses?.slice(0, 6);
  const filterOptions = [
    "filter1 filter3",
    "filter2 filter3",
    "filter4 filter5",
    "filter4",
    "filter1 filter3",
    "filter2 filter5",
    "filter4 filter5",
    "filter4",
  ];

  return (
    <div
      className={` filter-contents flex flex-wrap sm:-mx-15px box-content mt-7 lg:mt-25px`}
      data-aos="fade-up"
    >
      {courses?.length ? (
        courses.map((course, idx) => (
          <CourseCard
            key={idx}
            idx={idx}
            type={type}
            course={{
              ...course,
              filterOption: filterOptions[idx],
            }}
          />
        ))
      ) : (
        <span></span>
      )}
    </div>
  );
};

export default FilterCards;
