import React from "react";
import ProductCard from "../products/ProductCard";

const FourColumContent = ({ products, handleCurrentProduct }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 -mx-15px">
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

export default FourColumContent;
