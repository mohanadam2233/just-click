"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import HeroSlide4 from "./HeroSlide4";
import { Pagination } from "swiper/modules";

const HeroSlider4 = () => {
  const slides = [
    {
      title: (
        <>
          The Best Machine Learning for Smart{" "}
          <span className="text-secondaryColor">AI</span> Systems.
        </>
      ),
      tag: "Artificial Intelligence",
    },
    {
      title: "Techniques for Intelligent Artificial Intelligence.",
      tag: "Artificial Intelligence",
    },
    {
      title: (
        <>
          Awesome Machine Learning for Smart{" "}
          <span className="text-secondaryColor">AI</span> Systems.
        </>
      ),
      tag: "Artificial Intelligence",
    },
  ];
  return (
    <Swiper
      pagination={{
        clickable: true,
      }}
      grabCursor={true}
      modules={[Pagination]}
      className={`ecommerce-slider py-50px md:py-100px lg:pt-100px lg:pb-150px 2xl:pt-155px 2xl:pb-180px 3xl:pb-250px`}
    >
      {slides.map((slide, idx) => (
        <SwiperSlide className="px-15px" key={idx}>
          <HeroSlide4 idx={idx} slide={slide} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider4;
