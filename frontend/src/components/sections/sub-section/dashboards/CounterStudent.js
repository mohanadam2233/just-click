import counter1 from "@/assets/images/counter/counter__1.png";
import counter2 from "@/assets/images/counter/counter__2.png";
import counter3 from "@/assets/images/counter/counter__3.png";
import CounterDashboard from "@/components/shared/dashboards/CounterDashboard";
import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";

const CounterStudent = () => {
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
      data: 12,
    },
  ];
  return (
    <CounterDashboard counts={counts}>
      <HeadingDashboard>Summery</HeadingDashboard>
    </CounterDashboard>
  );
};

export default CounterStudent;
