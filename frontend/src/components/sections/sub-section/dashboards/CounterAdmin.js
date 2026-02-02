import counter1 from "@/assets/images/counter/counter__1.png";
import counter2 from "@/assets/images/counter/counter__2.png";
import counter3 from "@/assets/images/counter/counter__3.png";
import counter4 from "@/assets/images/counter/counter__4.png";
import CounterDashboard from "@/components/shared/dashboards/CounterDashboard";
import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
const CounterAdmin = () => {
  const counts = [
    {
      name: "Enrolled Courses",
      image: counter1,
      data: 900,
      symbol: "+",
    },
    {
      name: "Active Courses",
      image: counter2,
      data: 500,
      symbol: "+",
    },
    {
      name: "Complete Courses",
      image: counter3,
      data: 300,
      symbol: "k",
    },
    {
      name: "Total Courses",
      image: counter4,
      data: 1500,
      symbol: "+",
    },
    {
      name: "Total Students",
      image: counter3,
      data: 30,
      symbol: "k",
    },
    {
      name: "OVER THE WORLD",
      image: counter4,
      data: 90,
      symbol: ",000k+",
    },
  ];
  return (
    <CounterDashboard counts={counts}>
      <HeadingDashboard>Dashboard</HeadingDashboard>
    </CounterDashboard>
  );
};

export default CounterAdmin;
