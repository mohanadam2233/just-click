import Blogs from "@/components/sections/blogs/Blogs";
import CoursesFilter2 from "@/components/sections/courses/CoursesFilter2";
import Hero6 from "@/components/sections/hero-banners/Hero6";
import Instructors from "@/components/sections/instructors/Instructors";
import PopularSubjects3 from "@/components/sections/popular-subjects/PopularSubjects3";
import PricingPlans from "@/components/sections/pricing-plans/PricingPlans";
import Registration from "@/components/sections/registrations/Registration";
import BrandHero from "@/components/sections/sub-section/BrandHero";
import Counter2 from "@/components/sections/sub-section/Counter2";
import React from "react";

const Home6 = () => {
  return (
    <>
      <Hero6 />
      <BrandHero />
      <PopularSubjects3 />
      <CoursesFilter2 />
      <Counter2 />
      <Registration />
      <PricingPlans />
      <Instructors />
      <Blogs />
    </>
  );
};

export default Home6;
