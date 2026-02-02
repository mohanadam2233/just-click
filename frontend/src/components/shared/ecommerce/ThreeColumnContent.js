import React from "react";
import ProductCard from "../products/ProductCard";

const ThreeColumnContent = ({ products, handleCurrentProduct }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 -mx-15px">
      {products?.map((product, idx) => (
        <ProductCard
          key={idx}
          product={product}
          handleCurrentProduct={handleCurrentProduct}
        />
      ))}
    </div>
  );
};

export default ThreeColumnContent;
