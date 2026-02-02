import About6 from "@/components/sections/abouts/About6";
import Blogs2 from "@/components/sections/blogs/Blogs2";
import FeatureCourses from "@/components/sections/featured-courses/FeatureCourses";
import Hero10 from "@/components/sections/hero-banners/Hero10";
import PopularSubjects from "@/components/sections/popular-subjects/PopularSubjects";
import PricingPlans from "@/components/sections/pricing-plans/PricingPlans";

import Programs2 from "@/components/sections/programs/Programs2";
import Counter2 from "@/components/sections/sub-section/Counter2";
import ImageGallery from "@/components/sections/sub-section/ImageGallery";
import Testimonials2 from "@/components/sections/testimonials/Testimonials2";
import React from "react";

const Home10 = () => {
  return (
    <>
      <Hero10 />
      <About6 />
      <PopularSubjects />
      <Counter2 type="lg" />
      <Programs2 />
      <FeatureCourses title={"Our online courses"} />
      <PricingPlans />
      <Testimonials2 />
      <ImageGallery />
      <Blogs2 />
    </>
  );
};

export default Home10;
