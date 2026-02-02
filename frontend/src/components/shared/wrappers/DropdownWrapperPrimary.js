import React from "react";

const DropdownWrapperPrimary = ({ children }) => {
  return (
    <div className="absolute top-0 z-medium  left-full  translate-y-10 invisible opacity-0 transition-all duration-300 group-hover/nested:visible group-hover/nested:opacity-100 group-hover/nested:translate-y-0 ">
      {children}
    </div>
  );
};

export default DropdownWrapperPrimary;
