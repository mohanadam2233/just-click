import Image from "next/image";
import TestimonialGroupImage1 from "@/assets/images/testimonial/testi__group__1.png";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import TestimonialsSlider2 from "@/components/shared/testimonials/TestimonialsSlider2";
import SectionNameSecondary from "@/components/shared/section-names/SectionNameSecondary";
import HeadingPrimaryXl from "@/components/shared/headings/HeadingPrimaryXl ";
const Testimonials2 = () => {
  return (
    <section>
      <div className="testimonial bg-lightGrey10 dark:bg-lightGrey10-dark relative z-0 overflow-hidden">
        <div className="container py-50px md:py-70px lg:py-20 2xl:pt-145px 2xl:pb-154px">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-30px lg:gap-0">
            {/* testimonial Left */}
            <div data-aos="fade-up">
              <SectionNameSecondary>EDUCATION SOLUTION</SectionNameSecondary>
              <HeadingPrimaryXl>
                Client Testimonial About Our Lms Agency
              </HeadingPrimaryXl>

              {/* Swiper */}
              <TestimonialsSlider2 />
            </div>
            {/* testimonial right */}
            <div data-aos="fade-up">
              <TiltWrapper>
                <div className="tilt pl-0 md:pl-70px">
                  <Image
                    className="w-full"
                    src={TestimonialGroupImage1}
                    alt=""
                    placeholder="blur"
                  />
                </div>
              </TiltWrapper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials2;
