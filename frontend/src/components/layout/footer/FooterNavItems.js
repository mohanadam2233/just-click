import FooterHeading from "@/components/shared/headings/FooterHeading";
import FooterNavItem from "./FooterNavItem";

const FooterNavItems = ({ list, idx }) => {
  const { heading, items } = list;
  return (
    <div
      className={` ${
        idx === 0
          ? "sm:col-start-1 md:col-start-7  lg:col-start-5 lg:col-span-2"
          : "sm:col-start-7 md:col-start-1  lg:col-start-7 lg:col-span-3 pl-0 2xl:pl-60px"
      }  sm:col-span-6`}
      data-aos="fade-up"
    >
      <FooterHeading>{heading}</FooterHeading>
      <ul className="flex flex-col gap-y-3">
        {items.map(({ name, path }, idx) => (
          <FooterNavItem key={idx} path={path} name={name} />
        ))}
      </ul>
    </div>
  );
};

export default FooterNavItems;
