
import Image from "next/image";
import TestimonialGroupImage1 from "@/assets/images/testimonial/testi__group__1.png";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import TestimonialsSlider2 from "@/components/shared/testimonials/TestimonialsSlider2";
import SectionNameSecondary from "@/components/shared/section-names/SectionNameSecondary";
import HeadingPrimaryXl from "@/components/shared/headings/HeadingPrimaryXl ";

const Testimonials2 = () => {
  return (
    <section className="overflow-hidden">
      <div className="bg-lightGrey10 dark:bg-lightGrey10-dark relative z-0">
        <div className="container py-50px md:py-70px lg:py-20 2xl:pt-145px 2xl:pb-154px">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-30px lg:gap-50px">
            
            {/* Testimonial Left: Text & Slider */}
            <div data-aos="fade-right" className="order-2 lg:order-1">
              <SectionNameSecondary>
                COMMUNITY FEEDBACK
              </SectionNameSecondary>
              
              <HeadingPrimaryXl>
                What Students Say About The <span className="text-secondaryColor">Portal</span>
              </HeadingPrimaryXl>
              
              <div className="mt-8">
                 {/* Note: Ensure the data inside TestimonialsSlider2 
                    is updated to reflect student/lecturer feedback 
                    instead of generic agency clients.
                 */}
                 <TestimonialsSlider2 />
              </div>
            </div>

            {/* Testimonial Right: Image */}
            <div data-aos="fade-left" className="order-1 lg:order-2 mb-10 lg:mb-0">
              <TiltWrapper>
                <div className="tilt px-4 md:px-0 lg:pl-10">
                  <Image
                    className="w-full h-auto object-cover hover:drop-shadow-xl transition-all duration-300"
                    src={TestimonialGroupImage1}
                    alt="Happy students using the platform"
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