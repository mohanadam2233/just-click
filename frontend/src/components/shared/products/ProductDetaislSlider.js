"use client";
import { useState } from "react";
import { Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductDetailsSlide from "./ProductDetailsSlide";
import Image from "next/image";

const ProductDetaislSlider = ({ products, currentId }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  return (
    <>
      <Swiper
        grabCursor={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[Thumbs]}
        className="product-details"
      >
        {products?.map(({ image }, idx) => (
          <SwiperSlide key={idx}>
            <ProductDetailsSlide image={image} />
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        spaceBetween={10}
        slidesPerView={5}
        freeMode={true}
        watchSlidesProgress
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        className="product-details-thumb mt-10px"
      >
        {products?.map(({ image }, idx) => (
          <SwiperSlide
            key={idx}
            className="swiper-slide cursor-pointer border border-borderColor dark:border-borderColor-dark"
          >
            <Image
              className="w-full"
              loading="lazy"
              alt=""
              src={image}
              placeholder="blur"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default ProductDetaislSlider;
