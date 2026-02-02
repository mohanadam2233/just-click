"use client";
import FeaturedSlider from "@/components/shared/featured-courses/FeaturedSlider";
import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import SectionName from "@/components/shared/section-names/SectionName";
import useIsTrue from "@/hooks/useIsTrue";
import { usePathname } from "next/navigation";

const FeatureCourses = ({ title, course, subTitle }) => {
  const path = usePathname();
  const id = path?.split("/")[2];
  const isHome10 = useIsTrue("/home-10");
  const isHome10Dark = useIsTrue("/home-10-dark");
  const isAbout = useIsTrue("/about");
  const isAboutDark = useIsTrue("/about-dark");
  const isCourseDetails = useIsTrue(`/courses/${id}`);
  const isCourseDetailsDark = useIsTrue(`/courses-dark/${id}`);
  return (
    <section>
      <div
        className={`${
          course ? "pt-30px " : isHome10 || isHome10Dark ? "" : "pt-20"
        }  pb-70px`}
      >
        <div
          className={isAbout || isAboutDark ? "container" : "container-fluid-2"}
        >
          {/* heading */}
          {isCourseDetails || isCourseDetailsDark ? (
            ""
          ) : (
            <div data-aos="fade-up" className="mb-5 md:mb-10">
              {subTitle ? <SectionName>{subTitle}</SectionName> : ""}
              <HeadingPrimary data-aos="fade-up">{title}</HeadingPrimary>
            </div>
          )}
          {/* featured cards */}

          <div data-aos="fade-up" className="sm:-mx-15px">
            {/* Swiper */}
            <FeaturedSlider />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCourses;
