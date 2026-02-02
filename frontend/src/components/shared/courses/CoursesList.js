import React from "react";
import CourseCard2 from "./CourseCard2";

const CoursesList = ({ courses, card, isList, isNotSidebar }) => {
  return (
    <div className="flex flex-col gap-30px">
      {courses?.length ? (
        courses?.map((course, idx) => (
          <CourseCard2
            key={idx}
            course={course}
            isList={isList}
            card={card}
            isNotSidebar={isNotSidebar}
          />
        ))
      ) : (
        <span></span>
      )}
    </div>
  );
};

export default CoursesList;
