import accordions from "@/libs/accordions";
import React from "react";
import MobileAccordion from "./MobileAccordion";
import Image from "next/image";
import megamenu2 from "@/assets/images/mega/mega_menu_2.png";
const AccordionPages = () => {
  const getStarte1dItems = [
    {
      name: "About",

      path: "/about",
    },
    {
      name: "About (Dark)",
      status: "New",
      path: "/about-dark",
    },
    {
      name: "Blog",
      path: "/blogs",
    },
    {
      name: "Blog (Dark)",
      path: "/blogs-dark",
    },
    {
      name: "Blog Details",
      path: "/blogs/1",
    },
    {
      name: "Blog Details (Dark)",
      path: "/blogs-dark/1",
    },
  ];
  const getStarte2dItems = [
    {
      name: "Error 404",
      path: "/error",
    },
    {
      name: "Error (Dark)",
      path: "/error-dark",
    },
    {
      name: "Event Details",
      path: "/events/1",
    },
    {
      name: "Zoom",
      status: "Online Call",
      path: "/zoom/meetings",
    },
    {
      name: "Zoom Meeting (Dark)",
      path: "/zoom/meetings-dark",
    },
    {
      name: "Zoom  Details",
      path: "/zoom/meetings/952428993687",
    },
  ];
  const getStarte3dItems = [
    {
      name: "Meeting Details (Dark)",
      path: "/zoom/meetings-dark/952428993687",
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
      name: "Maintenance",
      path: "/maintenance",
    },
    {
      name: "Maintenance Dark",
      path: "/maintenance-dark",
    },
    {
      name: "Terms & Condition",
      path: "#",
    },
  ];
  const getStarte4dItems = [
    {
      name: "Terms & Condition (Dark)",
      path: "#",
    },

    {
      name: "Privacy Policy",
      path: "#",
    },

    {
      name: "Privacy Policy (Dark)",
      path: "#",
    },

    {
      name: "Success Stories",
      path: "#",
    },

    {
      name: "Success Stories (Dark)",
      path: "#",
    },

    {
      name: "Work Policy",
      path: "#",
    },
  ];
  const items = [
    {
      name: "Get Started 1",
      path: "#",
      accordion: true,
      items: getStarte1dItems,
    },

    {
      name: "Get Started 2",
      path: "#",
      accordion: true,
      items: getStarte2dItems,
    },

    {
      name: "Get Started 3",
      path: "#",
      accordion: true,
      items: getStarte3dItems,
    },

    {
      name: "Get Started 4",
      path: "#",
      accordion: true,
      items: getStarte4dItems,
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

export default AccordionPages;
