import FilterCards from "@/components/shared/courses/FilterCards";
import FilterController2 from "@/components/shared/courses/FilterController2";
import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import SectionName from "@/components/shared/section-names/SectionName";
import FilterControllerWrapper from "@/components/shared/wrappers/FilterControllerWrapper";

const CoursesFilter2 = ({ type }) => {
  return (
    <section>
      <div className="pt-50px pb-10 md:pt-70px md:pb-50px lg:pt-20 2xl:pt-100px 2xl:pb-70px bg-lightGrey7 dark:bg-lightGrey7-dark">
        <div
          className={`filter-container ${
            type ? "container-fluid-2" : " container"
          }`}
        >
          {/* courses Heading */}
          <div className="mb-5 md:mb-10" data-aos="fade-up">
            <div className="text-center">
              <SectionName>Course List</SectionName>
            </div>

            <HeadingPrimary text="center">
              Perfect Online{" "}
              <span className="relative after:w-full after:h-[7px] z-0 after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5 after:z-[-1]">
                Course
              </span>
              <br />
              Your Carrer
            </HeadingPrimary>
          </div>

          {/* courses tabs */}
          <FilterControllerWrapper>
            <FilterController2 />
          </FilterControllerWrapper>
          {/* course cards */}

          <FilterCards type={type} />
        </div>
      </div>
    </section>
  );
};

export default CoursesFilter2;
