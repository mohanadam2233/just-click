import Subject3 from "@/components/shared/popular-subjects/Subject3";

const PopularSubjects3 = ({ subject }) => {
  const subjects = [
    {
      title: "Art & Design",
      desc: "10 Courses",
    },
    {
      title: "Development",
      desc: "15 Courses",
    },
    {
      title: "Lifestyle",
      desc: "12 Courses",
    },
    {
      title: "Personal Development",
      desc: "8 Courses",
    },
    {
      title: "Business",
      desc: "9 Courses",
    },
    {
      title: "Finance",
      desc: "10 Courses",
    },
    {
      title: "Marketing",
      desc: "21 Courses",
    },
    {
      title: "Photography",
      desc: "10 Courses",
    },
    {
      title: "Data Science",
      desc: "16 Courses",
    },
    {
      title: "Health & Fitness",
      desc: "10 Courses",
    },
    {
      title: "Web Design",
      desc: "12 Courses",
    },
    {
      title: "Mobile Application",
      desc: "10 Courses",
    },
  ];
  return (
    <section>
      <div className={subject ? "container-fluid-2" : "container"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-30px pt-10 md:pt-0 pb-100px">
          {subjects.map((subject, idx) => (
            <Subject3 key={idx} subject={subject} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularSubjects3;
