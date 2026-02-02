import DropdownContainer from "@/components/shared/containers/DropdownContainer";
import Image from "next/image";
import React from "react";
import DropdownItems from "./DropdownItems";
import megaMenu2 from "@/assets/images/mega/mega_menu_2.png";
const DropdownPages = () => {
  const lists = [
    {
      title: "Get Started 1",
      items: [
        {
          name: "About",
          status: null,
          path: "/about",
        },
        {
          name: "About (Dark)",
          status: "New",
          path: "/about-dark",
        },
        {
          name: "Blog",
          status: null,
          path: "/blogs",
        },
        {
          name: "Blog (Dark)",
          status: null,
          path: "/blogs-dark",
        },
        {
          name: "Blog Details",
          status: null,
          path: "/blogs/1",
        },
        {
          name: "Blog Details (Dark)",
          status: null,
          path: "/blogs-dark/1",
        },
      ],
    },
    {
      title: "Get Started 2",
      items: [
        {
          name: "Error 404",
          status: null,
          path: "/error",
        },
        {
          name: "Error (Dark)",
          status: null,
          path: "/error-dark",
        },
        {
          name: "Event Details",
          status: null,
          path: "/events/1",
        },
        {
          name: "Zoom",
          status: "Online Call",
          path: "/zoom/meetings",
        },
        {
          name: "Zoom Meeting (Dark)",
          status: null,
          path: "/zoom/meetings-dark",
        },
        {
          name: "Zoom  Details",
          status: null,
          path: "/zoom/meetings/952428993687",
        },
      ],
    },
    {
      title: "Get Started 3",
      items: [
        {
          name: "Meeting Details (Dark)",
          status: null,
          path: "/zoom/meetings-dark/952428993687",
        },
        {
          name: "Login",
          status: null,
          path: "/login",
        },
        {
          name: "Login (Dark)",
          status: null,
          path: "/login-dark",
        },
        {
          name: "Maintenance",
          status: null,
          path: "/maintenance",
        },
        {
          name: "Maintenance Dark",
          status: null,
          path: "/maintenance-dark",
        },
        {
          name: "Terms & Condition",
          status: null,
          path: "#",
        },
      ],
    },
    {
      title: "Get Started 4",
      items: [
        {
          name: "Terms & Condition (Dark)",
          status: null,
          path: "#",
        },

        {
          name: "Privacy Policy",
          status: null,
          path: "#",
        },

        {
          name: "Privacy Policy (Dark)",
          status: null,
          path: "#",
        },

        {
          name: "Success Stories",
          status: null,
          path: "#",
        },

        {
          name: "Success Stories (Dark)",
          status: null,
          path: "#",
        },

        {
          name: "Work Policy",
          status: null,
          path: "#",
        },
      ],
    },
  ];
  return (
    <DropdownContainer>
      <div className="grid grid-cols-4 gap-x-30px">
        {lists?.map((list, idx) => (
          <DropdownItems key={idx} list={list} />
        ))}
      </div>
      {/* dropdown banner */}
      <div className="pt-30px">
        <Image
          prioriy="false"
          placeholder="blur"
          src={megaMenu2}
          alt="Mega Menu"
          className="w-full rounded-standard"
        />
      </div>
    </DropdownContainer>
  );
};

export default DropdownPages;
