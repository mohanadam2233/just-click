import React from "react";
import DropdownPrimary from "./DropdownPrimary";

const DropdownPages2 = () => {
  const items = [
    {
      name: "About",
      status: null,
      path: "/about",
      type: "secondary",
    },
    {
      name: "About (Dark)",
      status: null,
      path: "/about-dark",
      type: "secondary",
    },
    {
      name: "Contact",
      status: null,
      path: "/contact",
      type: "secondary",
    },
    {
      name: "Contact (Dark)",
      status: null,
      path: "/contact-dark",
      type: "secondary",
    },
    {
      name: "Instructor",
      status: null,
      path: "/instructors",
      type: "secondary",
    },
    {
      name: "Instructor (Dark)",
      status: null,
      path: "/instructors-dark",
      type: "secondary",
    },
    {
      name: "Instructor-Details",
      status: null,
      path: "/instructors/1",
      type: "secondary",
    },
    {
      name: "Details (Dark)",
      status: null,
      path: "/instructors-dark/1",
      type: "secondary",
    },
    {
      name: "Event-Details",
      status: null,
      path: "/events/1",
      type: "secondary",
    },
    {
      name: "Details (Dark)",
      status: null,
      path: "/events-dark/1",
      type: "secondary",
    },
    {
      name: "Login",
      status: null,
      path: "/login",
      type: "secondary",
    },
    {
      name: "Login (Dark)",
      status: null,
      path: "/login-dark",
      type: "secondary",
    },
    {
      name: "Error",
      status: null,
      path: "/error",
      type: "secondary",
    },
    {
      name: "Error (Dark)",
      status: null,
      path: "/error-dark",
      type: "secondary",
    },
  ];
  return <DropdownPrimary items={items} />;
};

export default DropdownPages2;
