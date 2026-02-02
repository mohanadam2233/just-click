"use client";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "../products/ProductCard";
import ProductModal from "../products/ProductModal";
import { useState } from "react";
import getAllProducts from "@/libs/getAllProducts";

const FeaturedProductsSlider = () => {
  const products = getAllProducts();
  const featuredProducts = products.filter(({ featured }) => featured);
  const [currentProduct, setCurrentProduct] = useState(featuredProducts[0]);
  const handleCurrentProduct = (id) => {
    const product = featuredProducts.find(({ id: id1 }) => id1 === id);
    setCurrentProduct({ ...product });
  };

  return (
    <>
      <Swiper
        slidesPerView={1}
        grabCursor={true}
        navigation={true}
        modules={[Navigation]}
        breakpoints={{
          576: {
            slidesPerView: 2,
          },
          992: {
            slidesPerView: 3,
          },
          1500: {
            slidesPerView: 4,
          },
        }}
        className="featured-courses"
      >
        {featuredProducts?.map((product, idx) => (
          <SwiperSlide key={idx}>
            <ProductCard
              handleCurrentProduct={handleCurrentProduct}
              idx={idx}
              product={product}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <ProductModal product={currentProduct} />
    </>
  );
};

export default FeaturedProductsSlider;
