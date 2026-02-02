import QuizContainers from "@/components/shared/containers/QuizContainers";
import React from "react";

const StudentAssingmentsPrimary = () => {
  const allResults = [
    {
      id: 1,
      title: "Write a the 5",
      courseName: "Fundamentals",
      tm: 80,
      isSubmit: true,
      isDownload: true,
      totalSubmit: 2,
    },
    {
      id: 2,
      title: "Write a the 5",
      courseName: "Fundamentals",
      tm: 80,
      isSubmit: true,
      isDownload: true,
      totalSubmit: 2,
    },
    {
      id: 3,
      title: "Write a the 5",
      courseName: "Fundamentals",
      tm: 80,
      isSubmit: true,
      isDownload: true,
      totalSubmit: 2,
    },
    {
      id: 4,
      title: "Write a the 5",
      courseName: "Fundamentals",
      tm: 80,
      isSubmit: true,
      isDownload: true,
      totalSubmit: 2,
    },
  ];
  return (
    <QuizContainers allResults={allResults} title="Assignments" table={2} />
  );
};

export default StudentAssingmentsPrimary;
