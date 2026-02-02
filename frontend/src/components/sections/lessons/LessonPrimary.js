import lessons from "@/../public/fakedata/lessons.json";
import LessonAccordion from "@/components/shared/lessons/LessonAccordion";

const LessonPrimary = ({ id: id1 }) => {
  const { id, link } = lessons?.find(({ id }) => id1 === id) || {
    id: 1,
    link: "https://www.youtube.com/embed/vHdclsdkp28",
  };
  return (
    <section>
      <div className="container-fluid-2 pt-50px pb-100px">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-30px">
          {/* lesson left  */}
          <div className="xl:col-start-1 xl:col-span-4" data-aos="fade-up">
            {/* curriculum  */}
            <LessonAccordion />
          </div>
          {/* lesson right  */}
          <div
            className="xl:col-start-5 xl:col-span-8 relative"
            data-aos="fade-up"
          >
            <div>
              <div className="absolute top-0 left-0 w-full flex justify-between items-center px-5 py-10px bg-primaryColor leading-1.2 text-whiteColor">
                <h3 className="sm:text-size-22 font-bold">
                  Video Content lesson 01
                </h3>
                <a href="course-details.html" className="">
                  Close
                </a>
              </div>

              <div className="aspect-[16/9]">
                <iframe
                  src={link}
                  allowFullScreen=""
                  allow="autoplay"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LessonPrimary;
