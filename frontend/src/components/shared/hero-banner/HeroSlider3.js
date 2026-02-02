"use client";
import herobannerImage from "@/assets/images/herobanner/herobanner__slider.png";
import herobannerImage2 from "@/assets/images/herobanner/herobanner__slider__2.png";
import herobannerImage3 from "@/assets/images/herobanner/herobanner__slider__3.png";
import herobannerImage5 from "@/assets/images/herobanner/herobanner__slider__5.png";
import herobannerImage6 from "@/assets/images/herobanner/herobanner__slider__6.png";
import herobannerImage7 from "@/assets/images/herobanner/herobanner__slider__7.png";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import HeroSlide3 from "./HeroSlide3";
import useIsTrue from "@/hooks/useIsTrue";

const HeroSlider3 = () => {
  const isHome9 = useIsTrue("/home-9");
  const isHome9Dark = useIsTrue("/home-9-dark");
  const slides = [
    {
      title:
        isHome9 || isHome9Dark ? (
          <>
            Best Kindergarten Awesome{" "}
            <span className="text-secondaryColor">Solution</span>
          </>
        ) : (
          <>
            School Bag <span className="text-secondaryColor">Ninbn</span>
          </>
        ),
      image: isHome9 || isHome9Dark ? herobannerImage5 : herobannerImage,
      tag: "EDUCATION SOLUTION",
    },
    {
      title:
        isHome9 || isHome9Dark ? (
          <>
            Best Colorful <span className="text-secondaryColor">Career</span>
          </>
        ) : (
          <>
            Best Colorful <span className="text-secondaryColor">Career</span>
          </>
        ),
      image: isHome9 || isHome9Dark ? herobannerImage6 : herobannerImage2,
      tag: "Coror Solution",
    },
    {
      title:
        isHome9 || isHome9Dark ? (
          <>
            {" "}
            Reading Table <span className="text-secondaryColor">Lamp</span>
          </>
        ) : (
          <>
            Reading Table <span className="text-secondaryColor">Lamp</span>
          </>
        ),
      image: isHome9 || isHome9Dark ? herobannerImage7 : herobannerImage3,
      tag: "Minimal Solution",
    },
  ];
  return (
    <Swiper
      navigation={true}
      pagination={{
        clickable: true,
      }}
      grabCursor={true}
      modules={[Navigation, Pagination]}
      className={`ecommerce-slider ${
        isHome9 || isHome9Dark ? "kindergarden" : ""
      } py-50px md:py-100px lg:pt-100px lg:pb-150px 2xl:pt-70px 2xl:pb-30 4xl:pt-155px 4xl:pb-250px`}
    >
      {slides.map((slide, idx) => (
        <SwiperSlide className="px-15px" key={idx}>
          <HeroSlide3 idx={idx} slide={slide} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider3;
