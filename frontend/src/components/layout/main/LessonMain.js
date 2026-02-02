import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import LessonPrimary from "@/components/sections/lessons/LessonPrimary";
import React from "react";

const LessonMain = ({ id }) => {
  return <LessonPrimary id={parseInt(id)} />;
};

export default LessonMain;
