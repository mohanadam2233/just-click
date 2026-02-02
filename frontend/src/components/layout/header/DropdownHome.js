import DropdownPrimary from "./DropdownPrimary";

const DropdownHome = () => {
  const items = [
    {
      name: "Home Style 1",
      status: null,
      path: "/",
      type: "secondary",
    },
    {
      name: "Home 1 (Dark)",
      status: null,
      path: "/home-1-dark",
      type: "secondary",
    },
    {
      name: "Home Style 2",
      status: null,
      path: "/home-2",
      type: "secondary",
    },
    {
      name: "Home 2 (Dark)",
      status: null,
      path: "/home-2-dark",
      type: "secondary",
    },
    {
      name: "Home Style 3",
      status: null,
      path: "/home-3",
      type: "secondary",
    },
    {
      name: "Home 3 (Dark)",
      status: null,
      path: "/home-3-dark",
      type: "secondary",
    },
  ];
  return <DropdownPrimary items={items} />;
};

export default DropdownHome;
