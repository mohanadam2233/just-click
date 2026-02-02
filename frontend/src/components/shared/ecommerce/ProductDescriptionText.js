import React from "react";

const ProductDescriptionText = ({ children }) => {
  return (
    <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px">
      {children}
    </p>
  );
};

export default ProductDescriptionText;
