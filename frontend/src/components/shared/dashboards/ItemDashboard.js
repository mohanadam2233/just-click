"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ItemDashboard = ({ item }) => {
  const currentPath = usePathname();
  const { name, path, icon, tag, subItems } = item;

  // State to handle collapsing
  const [isOpen, setIsOpen] = useState(false);

  const isActive = currentPath === path;
  const hasSubItems = subItems && subItems.length > 0;

  const toggleDropdown = (e) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <li className="border-b border-borderColor dark:border-borderColor-dark">
      <div
        className={`flex justify-between items-center py-10px cursor-pointer ${
          isActive
            ? "text-primaryColor"
            : "text-contentColor dark:text-contentColor-dark"
        } hover:text-primaryColor transition-all`}
        onClick={toggleDropdown}
      >
        {hasSubItems ? (
          <div className="flex gap-3 text-nowrap items-center grow">
            {icon} {name}
          </div>
        ) : (
          <Link href={path} className="flex gap-3 text-nowrap items-center grow">
            {icon} {name}
          </Link>
        )}

        {/* Render Tag OR Chevron for dropdown */}
        {tag && (
          <span className="text-size-10 font-medium text-whiteColor px-9px bg-primaryColor leading-14px rounded-2xl">
            {tag}
          </span>
        )}

        {hasSubItems && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        )}
      </div>

      {/* Sub-items Menu */}
      {hasSubItems && (
        <ul
          className={`pl-8 overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-60 opacity-100 mb-2" : "max-h-0 opacity-0"
          }`}
        >
          {subItems.map((sub, index) => (
            <li key={index} className="py-2">
              <Link
                href={sub.path}
                className={`text-sm hover:text-primaryColor ${
                  currentPath === sub.path
                    ? "text-primaryColor font-bold"
                    : "text-contentColor"
                }`}
              >
                {sub.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default ItemDashboard;
