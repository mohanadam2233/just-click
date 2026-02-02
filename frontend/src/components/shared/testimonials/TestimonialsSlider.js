"use client";
import React from "react";
import testimonialImage1 from "@/assets/images/testimonial/testi_1.png";
import { Swiper, SwiperSlide } from "swiper/react";
import TestimonialSlide from "./TestimonialSlide";
import { Navigation } from "swiper/modules";
const TestimonialsSlider = () => {
  const testimonials = [
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage1,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation men who are so beguiled and demoraliz ed by the of the mo ment.Dislike men who are so beguiled and dems ed by the charms of pleas ure of the moment. Lorem ",
    },
  ];
  return (
    <Swiper
      className="mySwiper "
      slidesPerView={1}
      breakpoints={{
        768: {
          slidesPerView: 2,
        },
      }}
      loop={true}
      navigation={true}
      modules={[Navigation]}
    >
      {testimonials.map((testimonial, idx) => (
        <SwiperSlide key={idx}>
          <TestimonialSlide testimonial={testimonial} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default TestimonialsSlider;
