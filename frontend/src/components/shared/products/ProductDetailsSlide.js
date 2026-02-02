import Image from "next/image";
import React from "react";

const ProductDetailsSlide = ({ image }) => {
  return (
    <div className="border border-borderColor dark:border-borderColor-dark">
      <Image src={image} alt="" className="w-full" placeholder="blur" />
    </div>
  );
};

export default ProductDetailsSlide;
