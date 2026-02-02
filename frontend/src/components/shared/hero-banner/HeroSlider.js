"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import HeroSlide from "./HeroSlide";
import { EffectCards, Pagination } from "swiper/modules";
import getAllCourses from "@/libs/getAllCourses";
const HeroSlider = () => {
  const courses = getAllCourses();
  const cards = courses.slice(0, 3);

  return (
    <Swiper
      effect="cards"
      pagination={{ clickable: true }}
      grabCursor={true}
      modules={[EffectCards, Pagination]}
      className="card-slider px-30px md:px-0"
    >
      {cards.map((card, idx) => (
        <SwiperSlide
          className=" shadow-brand rounded-lg2 dark:bg-darkdeep3-dark dark:shadow-brand-dark mb-30px group"
          key={idx}
        >
          <HeroSlide card={card} idx={idx} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider;
