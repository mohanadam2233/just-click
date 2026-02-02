import FeaturedProductsSlider from "@/components/shared/featured-products/FeaturedProductsSlider";
import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import React from "react";

const FeaturedProducts = () => {
  return (
    <section>
      <div className="pt-30px pb-70px">
        <div className="container-fluid-2">
          {/* heading */}
          <div data-aos="fade-up" className="mb-5 md:mb-10">
            <HeadingPrimary data-aos="fade-up">
              Featured Products
            </HeadingPrimary>
          </div>

          {/* featured cards */}

          <div data-aos="fade-up" className="modal-container sm:-mx-15px">
            {/* Swiper */}
            <FeaturedProductsSlider />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
