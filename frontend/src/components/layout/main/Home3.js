
// import CoursesFilter from "@/components/sections/courses/CoursesFilter";
// import Hero3 from "@/components/sections/hero-banners/Hero3";

// import PopularSubjects2 from "@/components/sections/popular-subjects/PopularSubjects2";
// import Registration from "@/components/sections/registrations/Registration";
// import BrandHero from "@/components/sections/sub-section/BrandHero";
// import SuccessSteps from "@/components/sections/success-steps/SuccessSteps";
// import Testimonials2 from "@/components/sections/testimonials/Testimonials2";

// const Home3 = () => {
//   return (
//     <>
//       <Hero3 />
//       {/* <BrandHero /> */}
//       {/* <PopularSubjects2 /> */}
//       {/* <CoursesFilter /> */}
//       <Registration />
//       <SuccessSteps />

//       <Testimonials2 />
//       {/* <Blogs2 /> */}
//     </>
//   );
// };

// export default Home3;
// src/components/layout/main/Home3.jsx
import Hero from "@/components/sections/hero/Hero";
import ProblemFix from "@/components/sections/problem-fix/ProblemFix";
import CoreFeatures from "@/components/sections/features/CoreFeatures";
import UserRoles from "@/components/sections/user-roles/UserRoles";
import HowItWorks from "@/components/sections/how-it-works/HowItWorks";
import Faq from "@/components/sections/faq/Faq";



const Home3 = () => {
  return (
    <>
      <Hero />
      <ProblemFix />
      <CoreFeatures />
      <UserRoles />
      <HowItWorks />
      <Faq />


    </>
  );
};

export default Home3;