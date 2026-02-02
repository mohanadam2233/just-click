import QuizContainers from "@/components/shared/containers/QuizContainers";

const InstructorAssingmentsPrimary = () => {
  const allResults = [
    {
      id: 1,
      title: "Write a the 5",
      courseName: "Fundamentals",
      tm: 80,
      totalSubmit: 2,
    },
    {
      id: 2,
      title: "Write a the 5",
      courseName: "Fundamentals",

      tm: 80,
      totalSubmit: 2,
    },
    {
      id: 3,
      title: "Write a the 5",
      courseName: "Fundamentals",

      tm: 80,
      totalSubmit: 2,
    },
    {
      id: 4,
      title: "Write a the 5",
      courseName: "Fundamentals",

      tm: 80,
      totalSubmit: 2,
    },
  ];
  return (
    <QuizContainers allResults={allResults} title="Assignments" table={2} />
  );
};

export default InstructorAssingmentsPrimary;
