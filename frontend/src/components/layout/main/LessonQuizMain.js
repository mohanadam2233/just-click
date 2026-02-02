import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import LessonQuizPrimary from "@/components/sections/lesson-quiz/LessonQuizPrimary";
import React from "react";

const LessonQuizMain = () => {
  return (
    <>
      <HeroPrimary path={"Lesson Quiz"} title={"Lesson Quiz"} />
      <LessonQuizPrimary />
    </>
  );
};

export default LessonQuizMain;
