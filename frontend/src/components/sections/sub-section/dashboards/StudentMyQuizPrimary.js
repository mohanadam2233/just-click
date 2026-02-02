import QuizContainers from "@/components/shared/containers/QuizContainers";
import React from "react";

const StudentMyQuizPrimary = () => {
  const allResults = [
    {
      id: 1,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "Mice Jerry",
      qus: 4,
      tm: 8,
      ca: 4,
      isView: true,
      status: "cancel",
    },
    {
      id: 2,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "Mice Jerry",
      qus: 4,
      tm: 8,
      ca: 4,
      isView: true,
      status: "time over",
    },
    {
      id: 3,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "Mice Jerry",
      qus: 4,
      tm: 8,
      ca: 4,
      isView: true,
      status: "pass",
    },
    {
      id: 4,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "Mice Jerry",
      qus: 4,
      tm: 8,
      ca: 4,
      isView: true,
      status: "pass",
    },
  ];
  return <QuizContainers allResults={allResults} title={"My Quiz Attempts"} />;
};

export default StudentMyQuizPrimary;
