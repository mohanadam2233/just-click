import SectionNameSecondary from "@/components/shared/section-names/SectionNameSecondary";
import InstructorPrimary from "@/components/shared/instructors/InstructorPrimary";
import getAllInstructors from "@/libs/getAllInstructors";

const InstructorsPrimary = () => {
  const instructors = getAllInstructors();

  return (
    <section>
      <div className="container py-50px md:py-70px lg:py-20 2xl:py-100px  overflow-hidden">
        {/* heading */}

        <div data-aos="fade-up" className="text-center mb-45px">
          <SectionNameSecondary>EXPERT TEACHER</SectionNameSecondary>
          <h3 className="text-3xl md:text-size-35 lg:text-size-45 leading-10 md:leading-2xl font-bold text-blackColor dark:text-blackColor-dark">
            Our Expert Teacher
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-30px gap-y-15">
          {instructors?.map((instrutor, idx) => (
            <InstructorPrimary key={idx} instructor={instrutor} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorsPrimary;
