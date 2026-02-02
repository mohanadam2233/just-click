import AccordionContainer from "@/components/shared/containers/AccordionContainer";
import AccordionHome2 from "./AccordionHome2";
import AccordionBlog from "./AccordionBlog";
import AccordionCourses2 from "./AccordionCourses2";
import AccordionPages2 from "./AccordionPages2";
import MobileMenuItem from "./MobileItem";

const MobileItems2 = () => {
  const items = [
    {
      id: 1,
      name: "Home",
      path: "/",
      accordion: "accordion",
      children: <AccordionHome2 />,
    },
    {
      id: 2,
      name: "About",
      path: "/about",
      accordion: false,
      children: null,
    },
    {
      id: 3,
      name: "Blog",
      path: "/blogs",
      accordion: "accordion",
      children: <AccordionBlog />,
    },
    {
      id: 4,
      name: "Courses",
      path: "/courses",
      accordion: "accordion",
      children: <AccordionCourses2 />,
    },

    {
      id: 5,
      name: "Pages",
      path: "/about",
      accordion: "accordion",
      children: <AccordionPages2 />,
    },
    {
      id: 6,
      name: "Contact",
      path: "/contact",
      accordion: false,
      children: null,
    },
  ];

  return (
    <div className="pt-8 pb-6 border-b border-borderColor dark:border-borderColor-dark">
      <AccordionContainer>
        {items.map((item, idx) => (
          <MobileMenuItem key={idx} item={item} />
        ))}
      </AccordionContainer>
    </div>
  );
};

export default MobileItems2;
