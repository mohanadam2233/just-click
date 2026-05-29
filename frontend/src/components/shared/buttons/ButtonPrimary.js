"use client";

import Link from "next/link";

const ButtonPrimary = ({
  children,
  color,
  type,
  path,
  arrow,
  width,
  onClick,
  disabled = false,
}) => {
  const colorClasses =
    color === "secondary"
      ? "bg-secondaryColor border-secondaryColor hover:text-secondaryColor"
      : "bg-primaryColor border-primaryColor hover:text-primaryColor";

  const baseClasses = `inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium text-whiteColor hover:bg-whiteColor dark:hover:bg-whiteColor-dark dark:hover:text-whiteColor transition-colors ${
    width === "full" ? "w-full" : ""
  } ${colorClasses}`;

  if (type === "button" || type === "submit") {
    return (
      <button
        type={type === "submit" ? "submit" : "button"}
        onClick={onClick ? onClick : () => {}}
        disabled={disabled}
        className={`${baseClasses} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {children} {arrow && <i className="icofont-long-arrow-right"></i>}
      </button>
    );
  }

  return (
    <Link className={baseClasses} href={path}>
      {children} {arrow && <i className="icofont-long-arrow-right"></i>}
    </Link>
  );
};

export default ButtonPrimary;
