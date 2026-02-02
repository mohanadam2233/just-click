import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import HeadingXl from "@/components/shared/headings/HeadingXl";
import Reviews5Star from "@/components/shared/others/Reviews5Star";
import HreoName from "@/components/shared/section-names/HreoName";

const Hero11 = () => {
  return (
    <section data-aos="fade-up">
      {/* banner section */}
      <div className="bg-lightGrey11 dark:bg-lightGrey11-dark relative z-0 overflow-hidden py-50px md:py-100px lg:pb-150px 2xl:pb-180px 3xl:pb-30">
        <div className="container lg:max-w-770px xl:max-w-998px relative overflow-hidden lg:px-0">
          <div data-aos="fade-up" className="text-center">
            <div className="">
              <HreoName>EDUCATION SOLUTION</HreoName>
              <HeadingXl text="center">
                A Complete Guide to Web{" "}
                <span className="text-secondaryColor">Development.</span>
              </HeadingXl>
              <p className="text-size-15 md:text-lg text-blackColor dark:text-blackColor-dark font-medium">
                Lorem Ipsum is simply dummy text of the printing typesetting
                <br />
                industry. Lorem Ipsum has been
              </p>

              <div className="mt-30px">
                <ButtonPrimary path="/courses/1">
                  Enroll course now
                </ButtonPrimary>
              </div>
            </div>
          </div>

          <ul
            data-aos="fade-up"
            className="flex justify-between items-center px-30px py-23px mt-50px bg-borderColor dark:bg-borderColor-dark rounded-lg2"
          >
            <li>
              <div className="flex items-center">
                <div>
                  <i className="icofont-book-alt pr-5px text-primaryColor text-lg"></i>
                </div>
                <div>
                  <span className="text-sm text-black dark:text-blackColor-dark">
                    23 Lesson
                  </span>
                </div>
              </div>
            </li>
            <li>
              <div className="text-3xl font-semibold text-primaryColor font-inter">
                $32.00
                <del className="text-size-13 text-lightGrey4 font-semibold">
                  / $67.00
                </del>
              </div>
            </li>
            <li>
              <Reviews5Star type={"lg"} reviews={44} />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Hero11;
