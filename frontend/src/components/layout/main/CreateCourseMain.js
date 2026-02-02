import CreateCoursePrimary from "@/components/sections/create-course/CreateCoursePrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import React from "react";

const CreateCourseMain = () => {
  return (
    <>
      <HeroPrimary path={"Create Course"} title={"Create Course"} />
      <CreateCoursePrimary />
    </>
  );
};

export default CreateCourseMain;
