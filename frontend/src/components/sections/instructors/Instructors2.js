import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import SectionNameSecondary from "@/components/shared/section-names/SectionNameSecondary";
import Image from "next/image";
import React from "react";
import teamImage1 from "@/assets/images/team/team__1.png";
import teamImage2 from "@/assets/images/team/team__2.png";
import teamImage3 from "@/assets/images/team/team__3.png";
import Instructor from "@/components/shared/instructors/Instructor";
import HeadingPrimaryXl from "@/components/shared/headings/HeadingPrimaryXl ";
const Instructors2 = () => {
  const instructors = [
    {
      id: 1,
      name: "Mirnsdo Jons",
      image: teamImage1,
      desig: "INTERIOR DESIGNER",
    },
    {
      id: 2,
      name: "Daniel Rock",
      image: teamImage2,
      desig: "INTERIOR DESIGNER",
    },
    {
      id: 3,
      name: "Sajid Mustahidul",
      image: teamImage3,
      desig: "INTERIOR DESIGNER",
    },
  ];
  return (
    <section>
      <div className="container py-30px md:pt-10 md:pb-50px 2xl:pt-50px 2xl:pb-100px">
        {/* heading */}

        <div data-aos="fade-up" className="text-center mb-15px">
          <SectionNameSecondary>EXPERT TEACHER</SectionNameSecondary>
          <HeadingPrimaryXl text="center">Our Expert Teacher</HeadingPrimaryXl>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-30px">
          {/* teachers */}

          {instructors.map((instructor, idx) => (
            <Instructor key={idx} instructor={instructor} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instructors2;
