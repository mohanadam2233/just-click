"use client";
import React from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import useIsTrue from "@/hooks/useIsTrue";
import { usePathname } from "next/navigation";
import getAllCourses from "@/libs/getAllCourses";
import CourseCard from "../courses/CourseCard";
const FeaturedSlider = () => {
  const allCourses = getAllCourses();
  const path = usePathname();
  const id = path?.split("/")[2];
  const isHome9 = useIsTrue("/home-9");
  const isHome9Dark = useIsTrue("/home-9-dark");
  const isHome10 = useIsTrue("/home-10");
  const isHome10Dark = useIsTrue("/home-10-dark");
  const isAbout = useIsTrue("/about");
  const isAboutDark = useIsTrue("/about-dark");
  let isCourseDetails = useIsTrue(`/courses/${id}`);
  let isCourseDetailsDark = useIsTrue(`/courses-dark/${id}`);
  const isCourseDetails2 = useIsTrue(`/course-details-2`);
  const isCourseDetails2Dark = useIsTrue(`/course-details-2-dark"`);
  const isCourseDetails3 = useIsTrue(`/course-details-3`);
  const isCourseDetails3Dark = useIsTrue(`/course-details-3-dark`);
  const isInstructorDetails = useIsTrue(`/instructors/${id}`);
  const isInstructorDetailsDark = useIsTrue(`/instructors-dark/${id}`);
  if (
    isCourseDetails2 ||
    isCourseDetails2Dark ||
    isCourseDetails3 ||
    isCourseDetails3Dark ||
    isInstructorDetails ||
    isInstructorDetailsDark
  ) {
    isCourseDetails = true;
  }
  const commonCourses = allCourses
    .filter(({ featured }) => featured)
    .slice(6, 9);
  const featuredCourses =
    isHome9 || isHome9Dark
      ? allCourses.filter(({ featured }) => featured).slice(9, 15)
      : isHome10 ||
        isHome10Dark ||
        isInstructorDetails ||
        isInstructorDetailsDark
      ? allCourses.filter(({ featured }) => featured).slice(0, 6)
      : [...commonCourses, ...commonCourses];

  return (
    <Swiper
      slidesPerView={1}
      grabCursor={true}
      autoplay={
        isAbout || isAboutDark || isCourseDetails || isCourseDetailsDark
          ? {
              delay: 5000,
              disableOnInteraction: false,
            }
          : false
      }
      loop={
        isAbout || isAboutDark || isCourseDetails || isCourseDetailsDark
          ? true
          : false
      }
      breakpoints={{
        576: {
          slidesPerView: isCourseDetails || isCourseDetailsDark ? 2 : 1,
        },
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: isCourseDetails || isCourseDetailsDark ? 2 : 3,
        },
        1500: {
          slidesPerView:
            isAbout || isAboutDark
              ? 3
              : isCourseDetails || isCourseDetailsDark
              ? 2
              : 4,
        },
      }}
      navigation={
        isAbout || isAboutDark || isCourseDetails || isCourseDetailsDark
          ? false
          : true
      }
      modules={[Autoplay, Navigation]}
      className="featured-courses"
    >
      {featuredCourses.map((course, idx) => (
        <SwiperSlide key={idx}>
          <CourseCard type="primary" course={course} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default FeaturedSlider;
