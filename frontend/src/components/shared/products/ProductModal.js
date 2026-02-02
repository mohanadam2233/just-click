import React from "react";
import ProductDetails from "./ProductDetails";

const ProductModal = ({ product }) => {
  return (
    <div className="modal hidden fixed top-0 left-0 w-full h-full z-xxl transition-all duration-500 bg-lightBlack opacity-0 overflow-y-auto pb-10">
      <div className="modal-close fixed md:absolute top-0 left-0 w-full h-full z-xsmall cursor-zoom-out "></div>

      <div className="modal-content transition-all duration-500 -translate-y-20 bg-whiteColor dark:bg-whiteColor-dark p-15px max-w-250 mx-15px md:mx-auto mb-50px mt-110px md:my-150px relative z-small rounded-lg">
        <ProductDetails isModal={true} product={product} />
        {/* close button */}
        <div className="absolute top-4 right-3 z-xxl">
          <button className="modal-close group dark:bg-whiteColor rounded focus:shadow-select opacity-50 hover:opacity-75 p-1 inline-block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              className="w-4 h-4 fill-blackColor"
              fill="#000"
            >
              <path d="M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
