import React from "react";
import MobileAccordion from "./MobileAccordion";

const AccordionHome = () => {
  const lightDemos = [
    {
      name: "Home (Default)",
      path: "/",
    },
    {
      name: "Elegant",
      path: "/home-2",
    },
    {
      name: "Classic",
      path: "/home-3",
    },
    {
      name: "Classic LMS",
      path: "/home-4",
    },
    {
      name: "Online Course",
      path: "/home-5",
    },
    {
      name: "Marketplace",
      path: "/home-6",
    },
    {
      name: "University",
      path: "/home-7",
    },
    {
      name: "ECommerce",
      path: "/home-8",
    },
    {
      name: "Kindergarten",
      path: "/home-9",
    },
    {
      name: "Machine Learning",
      path: "/home-10",
    },
    {
      name: "Single Course",
      path: "/home-11",
    },
  ];
  const darkDemos = [
    {
      name: "Home Default ",
      path: "/home-1-dark",
    },
    {
      name: "Elegant (Dark)",
      path: "/home-2-dark",
    },
    {
      name: "Classic (Dark)",
      path: "/home-3-dark",
    },
    {
      name: "Classic LMS (Dark)",
      path: "/home-4-dark",
    },
    {
      name: "Online Course (Dark)",
      path: "/home-5-dark",
    },
    {
      name: "Marketplace (Dark)",
      path: "/home-6-dark",
    },
    {
      name: "University (Dark)",
      path: "/home-7-dark",
    },
    {
      name: "ECommerce (Dark)",
      path: "/home-8-dark",
    },
    {
      name: "Kindergarten (Dark)",
      path: "/home-9-dark",
    },
    {
      name: "Machine Learning (Dark)",
      path: "/home-10-dark",
    },
    {
      name: "Single Course (Dark)",
      path: "/home-11-dark",
    },
  ];
  const items = [
    {
      name: "Homes Light",
      path: "/",
      accordion: true,
      items: lightDemos,
    },
    {
      name: "Homes Dark",
      path: "/home-1-dark",
      accordion: true,
      items: darkDemos,
    },
  ];
  return <MobileAccordion items={items} />;
};

export default AccordionHome;
