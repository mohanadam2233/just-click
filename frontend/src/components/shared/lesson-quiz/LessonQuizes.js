import React from "react";
import LessonQuizSingle from "./LessonQuizSingle";

const LessonQuizes = () => {
  const quizes = [
    {
      id: 1,
      attemptTimes: 1,
      time: "Time: 5.0 Min",
      quiz: "What is your favourite song?",
      options: [
        {
          checked: false,
          name: "Example song 1",
        },
        {
          checked: false,
          name: "Example song 3",
        },
        {
          checked: true,
          name: "Example song 2",
        },
        {
          checked: true,
          name: "Example song 4",
        },
      ],
    },
    {
      id: 2,
      attemptTimes: 1,
      time: "Time: 4.0 Min",
      quiz: "What is your best Friend Name?",
      options: [
        {
          checked: false,
          name: "Example Name 1",
        },
        {
          checked: false,
          name: "Example Name 3",
        },
        {
          checked: true,
          name: "Example Name 2",
        },
        {
          checked: true,
          name: "Example Name 4",
        },
      ],
    },
    {
      id: 3,
      attemptTimes: 1,
      time: "Time:  6.0 Min",
      quiz: "What is your best Mentor Name?",
      options: [
        {
          checked: false,
          name: "Example Name 1",
        },
        {
          checked: false,
          name: "Example Name 3",
        },
        {
          checked: true,
          name: "Example Name 2",
        },
        {
          checked: true,
          name: "Example Name 4",
        },
      ],
    },
  ];
  return quizes.map((quiz, idx) => (
    <LessonQuizSingle
      key={idx}
      quiz={quiz}
      totalQuiz={quizes?.length}
      idx={idx}
    />
  ));
};

export default LessonQuizes;
