import React from "react";

const DropdownWrapper = ({ isOpen, children }) => {
  return (
    <div className="absolute top-full z-medium  left-0  translate-y-10 invisible opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 ">
      {children}
    </div>
  );
};

export default DropdownWrapper;
