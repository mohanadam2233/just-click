"use client";

import useTab from "@/hooks/useTab";
import CurriculumContent from "./CurriculumContent";
import DescriptoinContent from "./DescriptoinContent";
import ReviewsContent from "./ReviewsContent";
import InstructorContent from "./InstructorContent";
import CourseTabButton from "../buttons/CourseTabButton";
import TabContentWrapper from "../wrappers/TabContentWrapper";
import { useEffect } from "react";

const CourseDetailsTab = ({ type, id }) => {
  const { currentIdx, setCurrentIdx, handleTabClick } = useTab();
  const tabButtons = [
    {
      name: (
        <>
          <i className="icofont-book-alt mr-2"></i> Curriculum
        </>
      ),
      content: <CurriculumContent />,
    },
    {
      name: (
        <>
          {" "}
          <i className="icofont-paper mr-2"></i> Description
        </>
      ),
      content: <DescriptoinContent />,
    },
    {
      name: (
        <>
          <i className="icofont-star mr-2"></i> Reviews
        </>
      ),
      content: <ReviewsContent />,
    },
    {
      name: (
        <>
          <i className="icofont-teacher mr-2"></i> Instructor
        </>
      ),
      content: <InstructorContent id={id} />,
    },
  ];
  useEffect(() => {
    if (type === 2) {
      setCurrentIdx(1);
    }
    if (type === 3) {
      setCurrentIdx(2);
    }
  }, [, type, setCurrentIdx]);
  return (
    <div data-aos="fade-up" className="tab course-details-tab">
      <div className="tab-links flex flex-wrap md:flex-nowrap mb-30px rounded gap-0.5">
        {tabButtons?.map(({ name }, idx) => (
          <CourseTabButton
            key={idx}
            idx={idx}
            currentIdx={currentIdx}
            handleTabClick={handleTabClick}
          >
            {name}
          </CourseTabButton>
        ))}
      </div>

      <div className="tab-contents">
        {tabButtons?.map(({ content }, idx) => (
          <TabContentWrapper
            key={idx}
            isShow={currentIdx === idx ? true : false}
          >
            {content}
          </TabContentWrapper>
        ))}
      </div>
    </div>
  );
};

export default CourseDetailsTab;
