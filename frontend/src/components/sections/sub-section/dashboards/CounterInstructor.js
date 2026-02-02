import counter1 from "@/assets/images/counter/counter__1.png";
import counter2 from "@/assets/images/counter/counter__2.png";
import counter3 from "@/assets/images/counter/counter__3.png";
import counter4 from "@/assets/images/counter/counter__4.png";
import CounterDashboard from "@/components/shared/dashboards/CounterDashboard";
import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";

const CounterInstructor = () => {
  const counts = [
    {
      name: "Enrolled Courses",
      image: counter1,
      data: 27,
      symbol: "+",
    },
    {
      name: "Active Courses",
      image: counter2,
      data: 8,
      symbol: "+",
    },
    {
      name: "Complete Courses",
      image: counter3,
      data: 5,
      symbol: "k",
    },
    {
      name: "Total Courses",
      image: counter4,
      data: 14,
      symbol: "+",
    },
    {
      name: "Total Students",
      image: counter3,
      data: 10,
      symbol: "k",
    },
    {
      name: "Total Earning",
      image: counter4,
      data: 30,
      symbol: ",000k+",
    },
  ];
  return (
    <CounterDashboard counts={counts}>
      <HeadingDashboard>Dashboard</HeadingDashboard>
    </CounterDashboard>
  );
};

export default CounterInstructor;
