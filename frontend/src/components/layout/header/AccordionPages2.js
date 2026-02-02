import React from "react";
import MobileAccordion from "./MobileAccordion";

const AccordionPages2 = () => {
  const items = [
    {
      name: "About",
      path: "/about",
    },
    {
      name: "About (Dark)",
      path: "/about-dark",
    },
    {
      name: "Contact",
      path: "/contact",
    },
    {
      name: "Contact (Dark)",
      path: "/contact-dark",
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
      name: "Instructor-Details",
      path: "/instructors/1",
    },
    {
      name: "Details (Dark)",
      path: "/instructors-dark/1",
    },
    {
      name: "Event-Details",
      path: "/events/1",
    },
    {
      name: "Details (Dark)",
      path: "/events-dark/1",
    },
    {
      name: "Login",
      path: "/login",
    },
    {
      name: "Login (Dark)",
      path: "/login-dark",
    },
    {
      name: "Error",
      path: "/error",
    },
    {
      name: "Error (Dark)",
      path: "/error-dark",
    },
  ];
  return <MobileAccordion items={items} />;
};
export default AccordionPages2;
