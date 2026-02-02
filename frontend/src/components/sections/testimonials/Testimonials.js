import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import SectionName from "@/components/shared/section-names/SectionName";
import TestimonialsSlider from "@/components/shared/testimonials/TestimonialsSlider";

const Testimonials = () => {
  return (
    <section className="bg-lightGrey10 dark:bg-lightGrey10-dark relative py-50px md:py-70px lg:py-20 2xl:pt-100px 2xl:pb-110px">
      <div className="container">
        {/* courses Heading */}
        <div className="mb-5 md:mb-10" data-aos="fade-up">
          <div className="text-center">
            <SectionName>Course List</SectionName>
          </div>

          <HeadingPrimary text="center">
            Client{" "}
            <span className="relative after:w-full after:h-[7px] z-0 after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5 after:z-[-1]">
              Testimonial
            </span>
          </HeadingPrimary>
        </div>
        {/* testimonial slider */}
        <div
          className="testimonial -mx-15px relative bg-lightGrey10 dark:bg-lightGrey10-dark"
          data-aos="fade-up"
        >
          {/* Swiper */}
          <TestimonialsSlider />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
