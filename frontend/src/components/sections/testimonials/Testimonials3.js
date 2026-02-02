import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import Image from "next/image";
import Link from "next/link";
import aboutImage4 from "@/assets/images/about/about_4.png";
import FeaturedSlider from "@/components/shared/featured-courses/FeaturedSlider";
import getAllInstructors from "@/libs/getAllInstructors";
const Testimonials3 = ({ isInsTructorDetails, id: cidx }) => {
  const instructor = getAllInstructors()?.find(({ id }) => id == cidx);
  const { name, subject, imageLg } = instructor ? instructor : {};
  return (
    <section
      className={`${
        isInsTructorDetails
          ? "pt-70px pb-100px"
          : "py-50px md:py-70px lg:py-20 2xl:pt-0 2xl:pb-50px"
      }`}
    >
      <div
        className={
          isInsTructorDetails
            ? ""
            : "py-10 md:py-10 2xl:py-50px 3xl:py-30 mx-10px md:mx-50px 3xl:mx-150px bg-darkdeep3 dark:bg-darkdeep3-dark shadow-container rounded-5"
        }
      >
        <div className="container">
          {/* about section  */}
          <div className="grid grid-cols-1 lg:grid-cols-12 pt-30px gap-x-30px">
            {/* about left */}
            <div
              className="lg:col-start-1 lg:col-span-4 relative z-0 mb-30px lg:mb-0 pb-0 md:pb-30px xl:pb-0 overflow-visible"
              data-aos="fade-up"
            >
              <TiltWrapper>
                <div className="tilt">
                  <Image src={imageLg} alt="" className="w-full" />

                  <Image
                    className="absolute top-0 left-[-30px] animate-move-hor z-[-1]"
                    src={aboutImage4}
                    alt=""
                  />
                </div>
              </TiltWrapper>
            </div>
            {/* about right */}
            <div data-aos="fade-up" className="lg:col-start-5 lg:col-span-8">
              <div className="flex justify-between items-center flex-wrap md:flex-nowrap">
                <div>
                  <h3 className="text-size-25 md:text-size-40 lg:text-3xl 2xl:text-size-40 font-bold leading-34px md:leading-13.5 lg:leading-11 2xl:leading-13.5  text-blackColor dark:text-blackColor-dark">
                    {name}
                  </h3>
                  <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark">
                    Teches {subject}
                  </p>
                </div>
                <div>
                  <p className="text-blackColor dark:text-blackColor-dark">
                    Review:
                  </p>
                  <div>
                    <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                    <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                    <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                    <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                    <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                    <span className="text-xs text-lightGrey6">(44)</span>
                  </div>
                </div>
                <div>
                  <p className="text-blackColor dark:text-blackColor-dark">
                    Follow Us:
                  </p>
                  <ul className="flex gap-13px text-base text-contentColor dark:text-contentColor-dark">
                    <li>
                      <Link
                        className="hover:text-primaryColor"
                        href="https://www.facebook.com/"
                      >
                        <i className="icofont-facebook"></i>
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="hover:text-primaryColor"
                        href="https://x.com/"
                      >
                        <i className="icofont-twitter"></i>
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="hover:text-primaryColor"
                        href="https://www.instagram.com/"
                      >
                        <i className="icofont-instagram"></i>
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="hover:text-primaryColor"
                        href="https://www.youtube.com/"
                      >
                        <i className="icofont-youtube-play"></i>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <Link
                    href="#"
                    className="text-sm md:text-size-15 text-whiteColor bg-primaryColor border border-primaryColor px-10 py-10px hover:text-primaryColor hover:bg-whiteColor rounded inline-block dark:hover:bg-whiteColor-dark dark:hover:text-whiteColor"
                  >
                    Follow
                  </Link>
                </div>
              </div>

              <div className="pt-7 mt-30px border-t border-borderColor dark:border-borderColor-dark">
                <h4 className="text-xl text-blackColor dark:text-blackColor-dark font-semibold mb-1">
                  Short Bio
                </h4>
                <p className="leading-7 text-contentColor dark:text-contentColor-dark">
                  Only a quid me old mucker squiffy tomfoolery grub cheers ruddy
                  cor blimey guvnor in my flat, up the duff Eaton car boot up
                  the kyver pardon you A bit of {"how's"} your father David
                  skive off sloshed, {"don't"} get shirty with me chip shop
                  vagabond crikey bugger {"Queen's"} English chap. Matie boy
                  nancy boy bite your arm off up the kyver old no biggie
                  fantastic boot, David have it show off show off pick your nose
                  and blow off lost the plot porkies bits and bobs only a quid
                  bugger all mate, absolutely bladdered bamboozled {"it's"} your
                  round {"don't"} get shirty with me down the pub well.
                </p>
              </div>
              {isInsTructorDetails ? (
                <>
                  <div className="mb-10px mt-10">
                    <h4 className="text-3xl font-bold text-blackColor dark:text-blackColor-dark leading-1.2">
                      Online Course
                    </h4>
                  </div>
                  <div className="-mx-15px">
                    <FeaturedSlider />
                  </div>
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials3;
