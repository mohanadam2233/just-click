import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import LessonAssignmetnPrimary from "@/components/sections/lesson-assignment/LessonAssignmetnPrimary";

const LessonAssignmentMain = () => {
  return (
    <>
      <HeroPrimary path={"Assignment"} title={"Assignment"} />
      <LessonAssignmetnPrimary />
    </>
  );
};

export default LessonAssignmentMain;
