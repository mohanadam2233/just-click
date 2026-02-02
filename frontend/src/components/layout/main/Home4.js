import About3 from "@/components/sections/abouts/About3";
import Blogs2 from "@/components/sections/blogs/Blogs2";
import CoursesFilter from "@/components/sections/courses/CoursesFilter";
import Hero4 from "@/components/sections/hero-banners/Hero4";
import Instructors2 from "@/components/sections/instructors/Instructors2";
import PopularSubjects2 from "@/components/sections/popular-subjects/PopularSubjects2";
import Registration from "@/components/sections/registrations/Registration";
import BrandHero from "@/components/sections/sub-section/BrandHero";
import Testimonials2 from "@/components/sections/testimonials/Testimonials2";
import React from "react";

const Home4 = () => {
  return (
    <>
      <Hero4 />
      <BrandHero />
      <About3 />
      <PopularSubjects2 />
      <CoursesFilter />
      <Registration />
      <Instructors2 />
      <Testimonials2 />
      <Blogs2 />
    </>
  );
};

export default Home4;
