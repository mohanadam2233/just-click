import React from "react";

const SectionName = ({ children }) => {
  return (
    <span className="text-sm font-semibold text-primaryColor bg-whitegrey3 px-6 py-6px mb-4 rounded-full inline-block">
      {children}
    </span>
  );
};

export default SectionName;
