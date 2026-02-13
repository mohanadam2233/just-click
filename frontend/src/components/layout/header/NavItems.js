import Link from "next/link";

const NavItems = () => {
  const navItems = [
    { name: "Overview", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "About", path: "/about" },
  ];

  return (
    <div className="hidden lg:block">
      <ul className="flex gap-x-8">
        {navItems.map((item, idx) => (
          <li key={idx}>
            <Link 
              href={item.path} 
              className="text-sm font-semibold text-blackColor dark:text-whiteColor hover:text-primaryColor transition-colors"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavItems;