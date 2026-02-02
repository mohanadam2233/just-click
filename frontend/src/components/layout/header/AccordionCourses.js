import accordions from "@/libs/accordions";
import React from "react";
import MobileAccordion from "./MobileAccordion";
import Image from "next/image";
import megamenu2 from "@/assets/images/mega/mega_menu_1.png";
const AccordionCourses = () => {
  const items = [
    {
      name: "Get Started 1",
      path: "#",
      accordion: true,
      items: [
        {
          name: "Grid",
          status: "All Coures",
          path: "/courses",
        },
        {
          name: "Coures Grid (Dark)",

          path: "/courses-dark",
        },
        {
          name: "Coures Grid",

          path: "/course-grid",
        },
        {
          name: "Coures Grid (Dark)",

          path: "/course-grid-dark",
        },
        {
          name: "Coures List",

          path: "/course-list",
        },
        {
          name: "Coures List (Dark)",

          path: "/course-list-dark",
        },
      ],
    },

    {
      name: "Get Started 2",
      path: "#",
      accordion: true,
      items: [
        {
          name: "Course Details",

          path: "/courses/1",
        },
        {
          name: "Course Details (Dark)",

          path: "/courses-dark/1",
        },
        {
          name: "Course Details 2",

          path: "/course-details-2",
        },
        {
          name: "Details 2 (Dark)",

          path: "/course-details-2-dark",
        },
        {
          name: "Course Details 3",

          path: "/course-details-3",
        },
        {
          name: "Details 3 (Dark)",

          path: "/course-details-3-dark",
        },
      ],
    },

    {
      name: "Get Started 3",
      path: "#",
      accordion: true,
      items: [
        {
          name: "Become An Instructor",

          path: "/dashboards/become-an-instructor",
        },
        {
          name: "Create Coure",
          status: "Career",
          path: "/dashboards/create-course",
        },
        {
          name: "Instructor",

          path: "/instructors",
        },
        {
          name: "Instructor (Dark)",

          path: "/instructors-dark",
        },
        {
          name: "Instructor Details",

          path: "/instructors/1",
        },
        {
          name: "Course Lesson",
          status: "New",
          path: "/lessons/1",
        },
      ],
    },
  ];
  return (
    <MobileAccordion items={items}>
      <a href="#" className="pl-15px pt-3 pb-7px">
        <Image className="w-full" src={megamenu2} alt="" placeholder="blur" />
      </a>
    </MobileAccordion>
  );
};

export default AccordionCourses;
