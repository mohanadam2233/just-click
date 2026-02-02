import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import SectionName from "@/components/shared/section-names/SectionName";
import kids1 from "@/assets/images/program/kids_1.png";
import kids2 from "@/assets/images/program/kids_2.png";
import kids3 from "@/assets/images/program/kids_3.png";
import Program from "@/components/shared/programs/Program";

const Programs = () => {
  const programs = [
    {
      title: "Play Group",
      ageRange: "2-3 YEARS",
      image: kids1,
    },
    {
      title: "Junior KG",
      ageRange: "3 - 4 YEARS",
      image: kids3,
    },
    {
      title: "Senior KG",
      ageRange: "4-5 YEARS",
      image: kids2,
    },
  ];
  return (
    <section>
      <div className="container pt-100px pb-130px">
        {/* program Heading */}
        <div className="mb-5 md:mb-10" data-aos="fade-up">
          <div className="text-center">
            <SectionName>Programs</SectionName>
          </div>

          <HeadingPrimary text="center">
            Early learning{" "}
            <span className="relative after:w-full after:h-[7px] z-0 after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5 after:z-[-1]">
              Programs
            </span>
            <br />
            For Your Baby.
          </HeadingPrimary>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-30px text-center">
          {programs?.map((program, idx) => (
            <Program key={idx} program={program} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
