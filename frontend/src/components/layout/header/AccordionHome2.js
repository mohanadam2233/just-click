import React from "react";
import MobileAccordion from "./MobileAccordion";

const AccordionHome2 = () => {
  const items = [
    {
      name: "Home Style 1",
      path: "/",
    },
    {
      name: "Home 1 (Dark)",
      path: "/home-1-dark",
    },
    {
      name: "Home Style 2",
      path: "/home-2",
    },
    {
      name: "Home 2 (Dark)",
      path: "/home-2-dark",
    },
    {
      name: "Home Style 3",
      path: "/home-3",
    },
    {
      name: "Home 3 (Dark)",
      path: "/home-3-dark",
    },
  ];
  return <MobileAccordion items={items} />;
};
export default AccordionHome2;
