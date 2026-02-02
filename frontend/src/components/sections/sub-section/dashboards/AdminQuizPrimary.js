import QuizContainers from "@/components/shared/containers/QuizContainers";
import React from "react";

const AdminQuizPrimaryt = () => {
  const allResults = [
    {
      id: 1,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "Mice Jerry",
      qus: 4,
      tm: 8,
      ca: 4,
      status: "running",
    },
    {
      id: 2,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "Mice Jerry",
      qus: 4,
      tm: 8,
      ca: 4,
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
      status: "coming",
    },
    {
      id: 4,
      date: "December 26, 2024",
      title: "Write a on yourself using the 5",
      studentName: "Mice Jerry",
      qus: 4,
      tm: 8,
      ca: 4,
      status: "cancel",
    },
  ];
  return <QuizContainers allResults={allResults} />;
};

export default AdminQuizPrimaryt;
