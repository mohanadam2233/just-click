import React from "react";

const FixedShadow = ({ align }) => {
  return (
    <div>
      <div
        className={`fixed-shadow ${
          align === "right" ? "right-[-250px]" : "left-[-250px]"
        }`}
      ></div>
    </div>
  );
};

export default FixedShadow;
