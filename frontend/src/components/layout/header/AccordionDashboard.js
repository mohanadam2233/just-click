import React from "react";
import MobileAccordion from "./MobileAccordion";
import accordions from "@/libs/accordions";

const AccordionDashboard = () => {
  const items = [
    {
      name: "Admin",
      path: "/dashboards/admin-dashboard",
      accordion: true,
      items: [
        {
          name: "Admin Dashboard",

          path: "/dashboards/admin-dashboard",
        },
        {
          name: "Admin Profile",

          path: "/dashboards/admin-profile",
        },
        {
          name: "Message",

          path: "/dashboards/admin-message",
        },
        {
          name: "Courses",

          path: "/dashboards/admin-course",
        },
        {
          name: "Review",

          path: "/dashboards/admin-reviews",
        },
        {
          name: "Admin Quiz",

          path: "/dashboards/admin-quiz-attempts",
        },
        {
          name: "Setting",

          path: "/dashboards/admin-settings",
        },
      ],
    },
    {
      name: "Instructor",
      path: "/dashboards/instructor-dashboard",
      accordion: true,
      items: [
        {
          name: "Ins. Dashboard",

          path: "/dashboards/instructor-dashboard",
        },
        {
          name: "Ins. Profile",

          path: "/dashboards/instructor-profile",
        },
        {
          name: "Message",

          path: "/dashboards/instructor-message",
        },
        {
          name: "Wishlist",

          path: "/dashboards/instructor-wishlist",
        },
        {
          name: "Review",

          path: "/dashboards/instructor-reviews",
        },
        {
          name: "My Quiz",

          path: "/dashboards/instructor-my-quiz-attempts",
        },
        {
          name: "Order History",

          path: "/dashboards/instructor-order-history",
        },
        {
          name: "My Courses",

          path: "/dashboards/instructor-course",
        },
        {
          name: "Announcements",

          path: "/dashboards/instructor-announcments",
        },
        {
          name: "Quiz Attempt",

          path: "/dashboards/instructor-quiz-attempts",
        },

        {
          name: "Assignment",

          path: "/dashboards/instructor-assignments",
        },

        {
          name: "Setting",

          path: "/dashboards/instructor-settings",
        },
      ],
    },
    {
      name: "Student",
      path: "/dashboards/student-dashboard",
      accordion: true,
      items: [
        {
          name: "Dashboard",

          path: "/dashboards/student-dashboard",
        },
        {
          name: "Profile",

          path: "/dashboards/student-profile",
        },
        {
          name: "Message",

          path: "/dashboards/student-message",
        },
        {
          name: "Enrolled Courses",

          path: "/dashboards/student-enrolled-courses",
        },
        {
          name: "Wishlist",

          path: "/dashboards/student-wishlist",
        },
        {
          name: "Review",

          path: "/dashboards/student-reviews",
        },
        {
          name: "My Quiz",

          path: "/dashboards/student-my-quiz-attempts",
        },

        {
          name: "Assignment",

          path: "/dashboards/student-assignments",
        },

        {
          name: "Setting",

          path: "/dashboards/student-settings",
        },
      ],
    },
  ];
  return <MobileAccordion items={items} />;
};

export default AccordionDashboard;
