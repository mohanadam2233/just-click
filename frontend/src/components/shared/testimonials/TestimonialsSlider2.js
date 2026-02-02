"use client";
import { Swiper, SwiperSlide } from "swiper/react";

import TestimonialSlide2 from "./TestimonialSlide2";
import { Navigation } from "swiper/modules";
import testimonialImage2 from "@/assets/images/testimonial/testi_2.png";
const TestimonialsSlider2 = () => {
  const testimonials = [
    {
      name: "Mirnsdo Jons",
      image: testimonialImage2,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation and dislike men who are so beguiled and demorali ed by the of pleasure of the moment.Dislike men who are so beguiled and demoraliz worlds ed by the charms of pleasure of the moment. Lorem ipsum dolor sit amet, piscing elit.",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage2,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation and dislike men who are so beguiled and demorali ed by the of pleasure of the moment.Dislike men who are so beguiled and demoraliz worlds ed by the charms of pleasure of the moment. Lorem ipsum dolor sit amet, piscing elit.",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage2,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation and dislike men who are so beguiled and demorali ed by the of pleasure of the moment.Dislike men who are so beguiled and demoraliz worlds ed by the charms of pleasure of the moment. Lorem ipsum dolor sit amet, piscing elit.",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage2,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation and dislike men who are so beguiled and demorali ed by the of pleasure of the moment.Dislike men who are so beguiled and demoraliz worlds ed by the charms of pleasure of the moment. Lorem ipsum dolor sit amet, piscing elit.",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage2,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation and dislike men who are so beguiled and demorali ed by the of pleasure of the moment.Dislike men who are so beguiled and demoraliz worlds ed by the charms of pleasure of the moment. Lorem ipsum dolor sit amet, piscing elit.",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage2,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation and dislike men who are so beguiled and demorali ed by the of pleasure of the moment.Dislike men who are so beguiled and demoraliz worlds ed by the charms of pleasure of the moment. Lorem ipsum dolor sit amet, piscing elit.",
    },
    {
      name: "Mirnsdo Jons",
      image: testimonialImage2,
      desig: "Ui/Ux Designer",
      desc: "The other hand we denounce with righteou indg ation and dislike men who are so beguiled and demorali ed by the of pleasure of the moment.Dislike men who are so beguiled and demoraliz worlds ed by the charms of pleasure of the moment. Lorem ipsum dolor sit amet, piscing elit.",
    },
  ];
  return (
    <Swiper
      className="testimonial2 "
      slidesPerView={1}
      loop={true}
      navigation={true}
      modules={[Navigation]}
    >
      {testimonials.map((testimonial, idx) => (
        <SwiperSlide key={idx}>
          <TestimonialSlide2 testimonial={testimonial} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
export default TestimonialsSlider2;
