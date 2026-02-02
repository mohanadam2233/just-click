"use client";
import PublishContent from "./PublishContent";
import PendingContent from "./PendingContent";
import DraftContent from "./DraftContent";
import TabButtonSecondary from "../buttons/TabButtonSecondary";
import TabContentWrapper from "../wrappers/TabContentWrapper";
import useTab from "@/hooks/useTab";
import getAllCourses from "@/libs/getAllCourses";
const DashboardCoursesTab = () => {
  const { currentIdx, handleTabClick } = useTab();
  const courses = getAllCourses();

  const publishCourses = courses?.filter(
    ({ id }) => id === 2 || id === 3 || id === 4
  );

  const pendingCourses = courses?.filter(
    ({ id }) => id === 1 || id === 2 || id === 5
  );

  const draftCourses = courses?.filter(({ id }) => id === 1 || id === 2);

  const tabbuttons = [
    {
      name: "PUBLISH",
      content: <PublishContent courses={publishCourses} />,
    },
    {
      name: "PENDING",
      content: <PendingContent courses={pendingCourses} />,
    },
    {
      name: "DRAFT",
      content: <DraftContent courses={draftCourses} />,
    },
  ];
  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      {/* heading */}
      <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark">
        <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
          Course Status
        </h2>
      </div>
      <div>
        <div className=" flex flex-wrap mb-10px lg:mb-50px rounded gap-10px">
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

export default DashboardCoursesTab;
