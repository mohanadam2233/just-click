import React from "react";
import DropdownPrimary from "./DropdownPrimary";

const DropdownBlog = () => {
  const items = [
    {
      name: "Blog",
      status: null,
      path: "/blogs",
      type: "secondary",
    },
    {
      name: "Blog (Dark)",
      status: null,
      path: "/blogs-dark",
      type: "secondary",
    },
    {
      name: "Blog-Details",
      status: null,
      path: "/blogs/1",
      type: "secondary",
    },
    {
      name: "Blog-Details (Dark)",
      status: null,
      path: "/blogs-dark/1",
      type: "secondary",
    },
  ];
  return <DropdownPrimary items={items} />;
};

export default DropdownBlog;
