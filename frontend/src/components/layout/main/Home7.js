import About4 from "@/components/sections/abouts/About4";
import Blogs from "@/components/sections/blogs/Blogs";
import Brands from "@/components/sections/brands/Brands";
import EventsTab from "@/components/sections/events/EventsTab";
import FeatureCourses from "@/components/sections/featured-courses/FeatureCourses";
import Fees from "@/components/sections/fees/Fees";
import Hero7 from "@/components/sections/hero-banners/Hero7";
import Overview from "@/components/sections/overviews/Overview";
import PopularSubjects3 from "@/components/sections/popular-subjects/PopularSubjects3";
import Registration from "@/components/sections/registrations/Registration";
import FeaturesMarque from "@/components/sections/sub-section/FeaturesMarque";
import ImageGallery from "@/components/sections/sub-section/ImageGallery";
import Testimonials from "@/components/sections/testimonials/Testimonials";
import React from "react";

const Home7 = () => {
  return (
    <>
      <Hero7 />
      <FeaturesMarque />
      <About4 />
      <PopularSubjects3 subject="lg" />
      <Overview />
      <FeatureCourses title="Our online courses" course="2" />
      <Registration />
      <Fees />
      <EventsTab />
      <Testimonials />
      <Brands />
      <Blogs secondary={true} />

      <ImageGallery />
    </>
  );
};

export default Home7;
