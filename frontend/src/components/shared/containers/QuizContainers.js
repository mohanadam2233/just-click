import React from "react";
import LessonQuizResults from "../lesson-quiz/LessonQuizResults";
import QuizFilter from "../dashboards/QuizFilter";
import HeadingDashboard from "../headings/HeadingDashboard";

const QuizContainers = ({ allResults, title, table }) => {
  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      {/* heading */}

      <HeadingDashboard>{title ? title : "My Quiz Attempts"}</HeadingDashboard>

      {/* filter content */}
      <QuizFilter />
      <hr className="my-4 border-contentColor opacity-35" />
      {/* main content */}
      <LessonQuizResults
        allResults={allResults}
        isHeading={false}
        title={"Quiz Attempts"}
        table={table}
      />
    </div>
  );
};

export default QuizContainers;
