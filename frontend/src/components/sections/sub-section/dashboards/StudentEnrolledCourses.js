"use client";
import useTab from "@/hooks/useTab";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import TabButtonSecondary from "@/components/shared/buttons/TabButtonSecondary";
import EnrolledContent from "@/components/shared/dashboards/EnrolledContent";
import ActiveContent from "@/components/shared/dashboards/ActiveContent";
import CompletedContent from "@/components/shared/dashboards/CompletedContent";
import getAllCourses from "@/libs/getAllCourses";
const StudentEnrolledCourses = () => {
  const { currentIdx, handleTabClick } = useTab();
  const courses = getAllCourses();
  const enrolledCourses = courses
    ?.filter(({ id }) => (id > 0 && id < 6) || id === 8)
    ?.map((course) => ({
      ...course,
      isCompleted: course?.id < 4 ? true : false,
      isActive: course?.id === 4 || course?.id === 5 ? true : false,
      completedParchent: course?.id === 4 ? 80 : course?.id === 5 ? 70 : false,
    }));
  const activeCourses = courses
    ?.filter(({ id }) => id === 4 || id === 5)
    ?.map((course) => ({
      ...course,
      isActive: true,
      completedParchent: course?.id === 4 ? 80 : 70,
    }));
  const completedCourses = courses
    ?.filter(({ id }) => id < 4)
    ?.map((course) => ({
      ...course,
      isCompleted: true,
    }));

  const tabbuttons = [
    {
      name: "ENROLLED COURSES",
      content: <EnrolledContent courses={enrolledCourses} />,
    },
    {
      name: "ACTIVE COURSES",
      content: <ActiveContent courses={activeCourses} />,
    },
    {
      name: "COMPLETED COURSES",
      content: <CompletedContent courses={completedCourses} />,
    },
  ];
  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      {/* heading  */}
      <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark">
        <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
          My Profile
        </h2>
      </div>
      <div className="tab">
        <div className="tab-links flex flex-wrap mb-10px lg:mb-50px rounded gap-10px">
          {tabbuttons?.map(({ name }, idx) => (
            <TabButtonSecondary
              key={idx}
              name={name}
              idx={idx}
              currentIdx={currentIdx}
              handleTabClick={handleTabClick}
              button={"small"}
            />
          ))}
        </div>
        <div>
          {tabbuttons?.map(({ content }, idx) => (
            <TabContentWrapper
              key={idx}
              isShow={idx === currentIdx ? true : false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 sm:-mx-15px ">
                {content}
              </div>
            </TabContentWrapper>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentEnrolledCourses;
