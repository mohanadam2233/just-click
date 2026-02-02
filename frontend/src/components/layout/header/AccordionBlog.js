import MobileAccordion from "./MobileAccordion";

const AccordionBlog = () => {
  const items = [
    {
      name: "Blog",
      path: "/blogs",
    },
    {
      name: "Blog (Dark)",
      path: "/blogs-dark",
    },
    {
      name: "Blog-Details",
      path: "/blogs/1",
    },
    {
      name: "Blog-Details (Dark)",
      path: "/blogs-dark/1",
    },
  ];
  return <MobileAccordion items={items} />;
};

export default AccordionBlog;
