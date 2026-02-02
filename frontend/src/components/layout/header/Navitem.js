import Link from "next/link";

export default function Navitem({ navItem, idx, children }) {
  const { name, path, dropdown, isRelative } = navItem;

  return (
    <li key={idx} className={`nav-item group ${isRelative ? "relative" : ""}`}>
      <Link
        href={path}
        className="px-5 lg:px-10px 2xl:px-15px 3xl:px-5 py-10 lg:py-5 2xl:py-30px 3xl:py-10 leading-sm 2xl:leading-lg text-base lg:text-sm 2xl:text-base font-semibold block group-hover:text-primaryColor dark:text-whiteColor"
      >
        {name} {dropdown && <i className="icofont-rounded-down"></i>}
      </Link>

      {/* dropdown */}
      {children}
    </li>
  );
}
