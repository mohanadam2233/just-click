"use client";
import allEvents from "@/../public/fakedata/events.json";
import TabButtonPrimary from "@/components/shared/buttons/TabButtonPrimary";
import EventsTabItems from "@/components/shared/events/EventsTabItems";
import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import SectionName from "@/components/shared/section-names/SectionName";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import useTab from "@/hooks/useTab";

const EventsTab = () => {
  const events = allEvents?.slice(0, 4);
  const { currentIdx, handleTabClick } = useTab();
  const reverseEvents = [...events].reverse();

  const tabButtons = [
    { name: "Monday", content: <EventsTabItems events={events} idx={0} /> },
    {
      name: "Tuesday",
      content: <EventsTabItems events={reverseEvents} idx={1} />,
    },
    {
      name: "Wednesday",
      content: <EventsTabItems events={reverseEvents} idx={2} />,
    },
    {
      name: "Thursday",
      content: <EventsTabItems events={reverseEvents} idx={3} />,
    },
    {
      name: "Friday",
      content: <EventsTabItems events={reverseEvents} idx={4} />,
    },
  ];

  return (
    <section>
      <div className="overflow-hidden">
        <div className="container py-50px md:pt-60px lg:pt-50px lg:pb-20 2xl:pb-100px relative z-0">
          {/* animated bg */}
          <div className="absolute top-[20%] left-[-135px] z-[-1] animate-move-hor">
            <svg
              width="938"
              height="919"
              viewBox="0 0 938 919"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M926.588 668.954C845.79 881.299 578.082 976.498 328.645 881.587C79.2083 786.675 -57.5003 537.594 23.2975 325.25C104.095 112.905 842.659 -201.917 722.687 181.03C612.239 533.576 1007.39 456.609 926.588 668.954Z"
                fill="url(#paint0_linear_141_3)"
              ></path>
              <defs>
                <linearGradient
                  id="paint0_linear_141_3"
                  x1="621.24"
                  y1="112.617"
                  x2="328.645"
                  y2="881.586"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop
                    offset="0.9999"
                    stopColor="#FBAED8"
                    stopOpacity="0.08"
                  ></stop>
                  <stop offset="1" stopColor="#B64AA4" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* heading */}
          <div className="grid grid-cols-1 md:grid-cols-12 md:gap-30px items-center">
            <div className="md:col-start-1 md:col-span-7" data-aos="fade-up">
              <SectionName>Event List</SectionName>
              <HeadingPrimary>
                We Arrange{" "}
                <span className="relative after:w-full after:h-[7px] z-0 after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5 after:z-[-1]">
                  learning
                </span>
                <br className="hidden md:block" />
                Event for student
              </HeadingPrimary>
            </div>
            <div className="md:col-start-8 md:col-span-5" data-aos="fade-up">
              <p className="text-base text-contentColor dark:text-contentColor-dark relative before:w-1px before:h-full before:bg-darkdeep7 before:absolute before:left-[-30px]">
                Forging relationships between multi to national governments and
                global NGOs begins.
              </p>
            </div>
          </div>

          {/* event tabs */}
          <div className="tab">
            <div
              className="tab-links grid grid-cols-2 md:grid-cols-5 gap-11px text-blackColor text-lg lg:text-size-22 font-semibold font-hind bg-transparent mt-30px md:mt-10 mb-43px"
              data-aos="fade-up"
            >
              {tabButtons.map(({ name }, idx) => (
                <TabButtonPrimary
                  key={idx}
                  name={name}
                  handleTabClick={handleTabClick}
                  currentIdx={currentIdx}
                  idx={idx}
                  button="lg"
                />
              ))}
            </div>

            <div className="tab-contents">
              {tabButtons.map(({ content }, idx) => (
                <TabContentWrapper
                  key={idx}
                  isShow={idx === currentIdx || false}
                >
                  {content}
                </TabContentWrapper>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsTab;
