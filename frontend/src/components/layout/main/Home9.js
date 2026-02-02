import About1 from "@/components/sections/abouts/About1";
import Blogs from "@/components/sections/blogs/Blogs";
import FeatureCourses from "@/components/sections/featured-courses/FeatureCourses";
import Hero9 from "@/components/sections/hero-banners/Hero9";
import Instructors from "@/components/sections/instructors/Instructors";
import Instructors2 from "@/components/sections/instructors/Instructors2";
import Overview from "@/components/sections/overviews/Overview";
import PopularSubjects from "@/components/sections/popular-subjects/PopularSubjects";
import PricingPlans from "@/components/sections/pricing-plans/PricingPlans";
import Programs from "@/components/sections/programs/Programs";
import Registration from "@/components/sections/registrations/Registration";
import ImageGallery from "@/components/sections/sub-section/ImageGallery";

const Home9 = () => {
  return (
    <>
      <Hero9 />
      <About1 />
      <Programs />
      <PopularSubjects />
      <Overview />
      <FeatureCourses title="Our online courses" course="2" />
      <Registration />
      <PricingPlans />
      <Instructors2 />
      <Instructors />
      <Blogs />
      <ImageGallery />
    </>
  );
};

export default Home9;
