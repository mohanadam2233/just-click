import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import InstructorsPrimary from "@/components/sections/instructors/InstructorsPrimary";
import React from "react";

const InstructorMain = () => {
  return (
    <>
      <HeroPrimary path={"Instructor page"} title={"Instructor page"} />
      <InstructorsPrimary />
    </>
  );
};

export default InstructorMain;
