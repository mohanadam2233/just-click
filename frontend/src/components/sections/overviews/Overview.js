"use client";
import TabButtonSecondary from "@/components/shared/buttons/TabButtonSecondary";
import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import AboutContent from "@/components/shared/overviews/AboutContent";
import AwardContent from "@/components/shared/overviews/AwardContent";
import OurMissionContent from "@/components/shared/overviews/OurMissionContent";
import OurVissionContent from "@/components/shared/overviews/OurVissionContent";
import SectionName from "@/components/shared/section-names/SectionName";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import useTab from "@/hooks/useTab";
import React from "react";
import Counter2 from "../sub-section/Counter2";
import useIsTrue from "@/hooks/useIsTrue";
import EducationContent from "@/components/shared/overviews/EducationContent";
import CourseContent from "@/components/shared/overviews/CourseContent";

const Overview = () => {
  const { currentIdx, handleTabClick } = useTab();
  const isHome9 = useIsTrue("/home-9");
  const isHome9Dark = useIsTrue("/home-9-dark");
  const isAbout = useIsTrue("/about");
  const isAboutDark = useIsTrue("/about-dark");
  const tabButtons = [
    { name: "About", content: <AboutContent /> },
    {
      name: isAbout || isAboutDark ? "COURSE" : "OUR MISSION",
      content:
        isAbout || isAboutDark ? (
          <CourseContent isNotSidebar={true} />
        ) : (
          <OurMissionContent />
        ),
    },
    {
      name: isAbout || isAboutDark ? "AWARDS" : "OUR VISION",
      content:
        isAbout || isAboutDark ? <AwardContent /> : <OurVissionContent />,
    },
    {
      name: isAbout || isAboutDark ? "EDUCATION" : "AWARD",
      content: isAbout || isAboutDark ? <EducationContent /> : <AwardContent />,
    },
  ];
  return (
    <section>
      <div
        className={`container ${
          isHome9 || isHome9Dark
            ? "pt-100px"
            : isAbout || isAboutDark
            ? "pb-5 md:pb-10 lg:pb-50px 2xl:pb-10"
            : ""
        }`}
      >
        {/* overview  Heading */}
        {isAbout || isAboutDark ? (
          ""
        ) : (
          <div className="mb-5 md:mb-10 " data-aos="fade-up">
            <div className="text-center">
              <SectionName>Overview</SectionName>
            </div>

            <HeadingPrimary text="center">
              Perfect University{" "}
              <span className="relative after:w-full after:h-[7px] z-0 after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5 after:z-[-1]">
                Overview
              </span>{" "}
              <br />
              For Your Carrer
            </HeadingPrimary>
          </div>
        )}
        {/* overview tabs */}
        <div data-aos="fade-up" className="tab">
          <div
            className={`flex flex-wrap md:flex-nowrap  ${
              isAbout || isAboutDark ? "justify-start" : "justify-center"
            } mb-10px lg:mb-50px rounded gap-10px lg:gap-35px`}
          >
            {tabButtons.map(({ name }, idx) => (
              <TabButtonSecondary
                key={idx}
                name={name}
                idx={idx}
                currentIdx={currentIdx}
                handleTabClick={handleTabClick}
              />
            ))}
          </div>
          <div className="tab-contents">
            {tabButtons.map(({ content }, idx) => (
              <TabContentWrapper
                key={idx}
                idx={idx}
                isShow={idx === currentIdx || false}
              >
                {content}
              </TabContentWrapper>
            ))}
          </div>
        </div>
      </div>
      {isAbout || isAboutDark ? "" : <Counter2 />}
    </section>
  );
};

export default Overview;
