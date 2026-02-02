import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import Program from "@/components/shared/programs/Program";
import SectionName from "@/components/shared/section-names/SectionName";
import aiImage1 from "@/assets/images/program/ai_1.jpg";
import aiImage2 from "@/assets/images/program/ai_2.jpg";
import aiImage3 from "@/assets/images/program/ai_3.jpg";
import aiImage4 from "@/assets/images/program/ai_4.jpg";
const Programs2 = () => {
  const programs = [
    {
      title: "TECHNOLOGY",
      ageRange: "TECHNOLOGY",
      image: aiImage1,
    },
    {
      title: "Classifying Best Intelligence Photos",
      ageRange: "MACHINE",
      image: aiImage2,
    },
    {
      title: "Industry Labor Machine",
      ageRange: "ROBOT",
      image: aiImage3,
    },
    {
      title: "Education Super Al Studies",
      ageRange: "AUTOMATION",
      image: aiImage4,
    },
  ];
  return (
    <section>
      <div className="container-fluid-2 pb-100px">
        {/* program Heading  */}
        <div className="mb-5 md:mb-10" data-aos="fade-up">
          <div className="text-center">
            <SectionName>#Research</SectionName>
          </div>

          <HeadingPrimary text="center">
            Differentiating through case{" "}
            <span className="relative after:w-full after:h-[7px] z-0 after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5 after:z-[-1]">
              studies
            </span>
            <br />
            Machine learning.
          </HeadingPrimary>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-30px text-center">
          {programs?.map((program, idx) => (
            <Program key={idx} program={program} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs2;
