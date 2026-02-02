import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import LessonQuizResults from "@/components/shared/lesson-quiz/LessonQuizResults";
import LessonQuizes from "@/components/shared/lesson-quiz/LessonQuizes";
import LessonAccordion from "@/components/shared/lessons/LessonAccordion";
import React from "react";

const LessonQuizPrimary = () => {
  const allResults = [
    {
      id: 1,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "John Due",
      qus: 4,
      tm: 8,
      ca: 4,
      status: "pass",
    },
    {
      id: 2,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "John Due",
      qus: 4,
      tm: 8,
      ca: 4,
      status: "pass",
    },
    {
      id: 3,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "John Due",
      qus: 4,
      tm: 8,
      ca: 4,
      status: "pass",
    },
    {
      id: 4,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "John Due",
      qus: 4,
      tm: 8,
      ca: 4,
      status: "pass",
    },
  ];

  return (
    <section>
      <div className="container-fluid-2 py-100px">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-30px">
          {/* quiz left  */}
          <div className="xl:col-start-1 xl:col-span-4" data-aos="fade-up">
            {/* curriculum  */}
            <LessonAccordion />
          </div>
          {/* quiz right  */}
          <div
            className="xl:col-start-5 xl:col-span-8 relative"
            data-aos="fade-up"
          >
            <LessonQuizes />
            <div>
              <ButtonPrimary type={"submit"} arrow={true}>
                Quiz Submit
              </ButtonPrimary>
            </div>
            <br />
            <br />

            <LessonQuizResults allResults={allResults} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LessonQuizPrimary;
