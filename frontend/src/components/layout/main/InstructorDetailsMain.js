import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import Testimonials3 from "@/components/sections/testimonials/Testimonials3";
import React from "react";

const InstructorDetailsMain = ({ id }) => {
  return (
    <>
      <HeroPrimary path={"Instructor page"} title={"Instructor page"} />
      <Testimonials3 id={id} isInsTructorDetails={true} />
    </>
  );
};

export default InstructorDetailsMain;
