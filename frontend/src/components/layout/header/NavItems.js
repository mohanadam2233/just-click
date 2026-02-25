// src/components/layout/header/NavItems.jsx
import Link from "next/link";

const NavItems = () => {
  const navItems = [
    { name: "Features", path: "#features" },
    { name: "For lecturers", path: "#for-lecturers" },
    { name: "FAQ", path: "#faq" },
  ];

  return (
    <ul className="flex gap-x-8">
      {navItems.map((item, idx) => (
        <li key={idx}>
          <Link 
            href={item.path}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primaryColor dark:hover:text-primaryColor transition-colors"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavItems;