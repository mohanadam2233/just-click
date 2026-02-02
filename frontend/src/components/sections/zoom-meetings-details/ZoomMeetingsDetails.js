import Image from "next/image";

import meetingsImage from "@/assets/images/zoom/details.jpg";
import PopupVideo from "@/components/shared/popup/PopupVideo";
import Link from "next/link";
const ZoomMeetingsDetails = () => {
  return (
    <section>
      <div className="container py-10 md:py-50px lg:py-60px 2xl:py-100px">
        {/* meeting thumbnail */}
        <div className="overflow-hidden relative mb-50px">
          <Image src={meetingsImage} alt="" className="w-full" />
          <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-10">
            <PopupVideo />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-30px">
          <div className="lg:col-start-1 lg:col-span-8 space-y-[35px]">
            <div data-aos="fade-up">
              {/* meeting content */}
              <div className="space-y-5">
                <p
                  className="text-sm md:text-lg text-darkdeep4 !leading-30px"
                  data-aos="fade-up"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur vulputate vestibulum Phasellus rhoncus, dolor eget
                  viverra pretium, dolor tellus aliquet nunc, vitae ultricies
                  erat elit eu lacus. Vestibulum non justo consectetur, cursus
                  ante, tincidunt sapien. Nulla quis diam sit amet turpis
                  interdum accumsan quis nec enim. Vivamus faucibus ex sed nibh
                  egestas elementum. Mauris et bibendum dui. Aenean consequat
                  pulvinar luctus
                </p>
                <p
                  className="text-sm md:text-lg text-darkdeep4 !leading-30px"
                  data-aos="fade-up"
                >
                  We have covered many special events such as fireworks, fairs,
                  parades, races, walks, awards ceremonies, fashion shows,
                  sporting events, and even a memorial service.
                </p>
                <p
                  className="text-sm md:text-lg text-darkdeep4 !leading-30px"
                  data-aos="fade-up"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur vulputate vestibulum Phasellus rhoncus, dolor eget
                  viverra pretium, dolor tellus aliquet nunc, vitae ultricies
                  erat elit eu lacus. Vestibulum non justo consectetur, cursus
                  ante, tincidunt sapien. Nulla quis diam sit amet turpis
                  interdum accumsan quis nec enim. Vivamus faucibus ex sed nibh
                  egestas elementum. Mauris et bibendum dui. Aenean consequat
                  pulvinar luctus.
                </p>

                <h4
                  className="text-2xl font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-30px"
                  data-aos="fade-up"
                >
                  Why search Is Important ?
                </h4>
                <ul className="space-y-[15px]">
                  <li className="flex items-center group ">
                    <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                    <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px max-w-[508px] text-contentColor dark:text-contentColor-dark">
                      Lorem Ipsum is simply dummying text of the printing
                      andtypesetting industry most of the standard.
                    </p>
                  </li>
                  <li className="flex items-center group">
                    <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                    <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px max-w-[508px] text-contentColor dark:text-contentColor-dark">
                      Lorem Ipsum is simply dummying text of the printing
                      andtypesetting industry most of the standard.
                    </p>
                  </li>
                  <li className="flex items-center group">
                    <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                    <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px max-w-[508px] text-contentColor dark:text-contentColor-dark">
                      Lorem Ipsum is simply dummying text of the printing
                      andtypesetting industry most of the standard.
                    </p>
                  </li>
                  <li className="flex items-center group">
                    <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                    <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px max-w-[508px] text-contentColor dark:text-contentColor-dark">
                      Lorem Ipsum is simply dummying text of the printing
                      andtypesetting industry most of the standard.
                    </p>
                  </li>
                </ul>

                <p
                  className="text-sm md:text-lg text-darkdeep4 !leading-30px"
                  data-aos="fade-up"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur vulputate vestibulum Phasellus rhoncus, dolor eget
                  viverra pretium, dolor tellus aliquet nunc, vitae ultricies
                  erat elit eu lacus. Vestibulum non justo consectetur, cursus
                  ante, tincidunt sapien. Nulla quis diam sit amet turpis
                  interdum accumsan quis nec enim. Vivamus faucibus ex sed nibh
                  egestas elementum. Mauris et bibendum dui. Aenean consequat
                  pulvinar luctus
                </p>
              </div>
            </div>
          </div>
          {/* blog sidebar */}
          <div className="lg:col-start-9 lg:col-span-4">
            <div>
              {/* enroll section */}
              <div
                className="py-33px px-25px shadow-event mb-30px bg-whiteColor dark:bg-whiteColor-dark"
                data-aos="fade-up"
              >
                <div className="flex justify-between mb-50px">
                  <div className="text-size-21 font-bold text-primaryColor font-inter leading-25px">
                    $32.00
                    <del className="text-sm text-lightGrey4 font-semibold">
                      / $67.00
                    </del>
                  </div>
                  <div>
                    <a
                      href="#"
                      className="uppercase text-sm font-semibold text-secondaryColor2 leading-27px px-2 bg-whitegrey1 dark:bg-whitegrey1-dark"
                    >
                      68% OFF
                    </a>
                  </div>
                </div>
                <ul>
                  <li className="flex items-center mb-4.5 pb-4.5 border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <i className="icofont-teacher text-size-22 mr-10px text-blackColor dark:text-blackColor-dark"></i>
                    </div>
                    <div className="flex-grow flex justify-between items-center text-blackColor dark:text-blackColor-dark">
                      <p>Instructor:</p>
                      <Link
                        className="font-bold text-contentColor hover:text-secondaryColor dark:text-contentColor-dark dark:hover:text-secondaryColor"
                        href="/instructors/1"
                      >
                        D. Willaim
                      </Link>
                    </div>
                  </li>

                  <li className="flex items-center mb-4.5 pb-4.5 border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <i className="icofont-clock-time text-size-22 mr-10px text-blackColor dark:text-blackColor-dark"></i>
                    </div>
                    <div className="flex-grow flex justify-between items-center text-blackColor dark:text-blackColor-dark">
                      <p>Time:</p>
                      <p>3.00PM</p>
                    </div>
                  </li>

                  <li className="flex items-center mb-4.5 pb-4.5 border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <i className="icofont-calendar text-size-22 mr-10px text-blackColor dark:text-blackColor-dark"></i>
                    </div>
                    <div className="flex-grow flex justify-between items-center text-blackColor dark:text-blackColor-dark">
                      <p>Date:</p>
                      <p>10/06/2024</p>
                    </div>
                  </li>

                  <li className="flex items-center mb-4.5 pb-4.5 border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <i className="icofont-document-folder text-size-22 mr-10px text-blackColor dark:text-blackColor-dark"></i>
                    </div>
                    <div className="flex-grow flex justify-between items-center text-blackColor dark:text-blackColor-dark">
                      <p>Time Zone:</p>
                      <p>+9</p>
                    </div>
                  </li>

                  <li className="flex items-center mb-4.5 pb-4.5 border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <i className="icofont-learn text-size-22 mr-10px text-blackColor dark:text-blackColor-dark"></i>
                    </div>
                    <div className="flex-grow flex justify-between items-center text-blackColor dark:text-blackColor-dark">
                      <p>Enrolled:</p>
                      <p>65 students</p>
                    </div>
                  </li>

                  <li className="flex items-center mb-4.5 pb-4.5 border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <i className="icofont-globe-alt text-size-22 mr-10px text-blackColor dark:text-blackColor-dark"></i>
                    </div>
                    <div className="flex-grow flex justify-between items-center text-blackColor dark:text-blackColor-dark">
                      <p>Language:</p>
                      <p>English</p>
                    </div>
                  </li>

                  <li className="flex items-center mb-4.5 pb-4.5 border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <i className="icofont-certificate text-size-22 mr-10px text-blackColor dark:text-blackColor-dark"></i>
                    </div>
                    <div className="flex-grow flex justify-between items-center text-blackColor dark:text-blackColor-dark">
                      <p>Certificate:</p>
                      <p>Yes</p>
                    </div>
                  </li>
                </ul>
                <div>
                  <Link
                    href="/login"
                    className="text-size-15 text-whiteColor bg-primaryColor px-14 py-10px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
                  >
                    Sign Up Now
                  </Link>
                </div>
              </div>
              {/* social area */}
              <div
                className="p-5 md:p-30px lg:p-5 2xl:p-30px mb-30px border border-borderColor2 dark:border-borderColor2-dark"
                data-aos="fade-up"
              >
                <h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold pl-2 before:w-0.5 relative before:h-[21px] before:bg-primaryColor before:absolute before:bottom-[5px] before:left-0 leading-30px mb-25px">
                  Follow Us
                </h4>
                <div>
                  <ul className="flex gap-10px items-center">
                    <li>
                      <a
                        href="https://www.facebook.com/"
                        className="w-38px h-38px leading-38px text-center text-blackColor2 bg-whitegrey2 hover:text-whiteColor hover:bg-primaryColor dark:bg-whitegrey2-dark dark:text-blackColor2-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor rounded"
                      >
                        <i className="icofont-facebook"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.youtube.com/"
                        className="w-38px h-38px leading-38px text-center text-blackColor2 bg-whitegrey2 hover:text-whiteColor hover:bg-primaryColor dark:bg-whitegrey2-dark dark:text-blackColor2-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor rounded"
                      >
                        <i className="icofont-youtube-play"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.instagram.com/"
                        className="w-38px h-38px leading-38px text-center text-blackColor2 bg-whitegrey2 hover:text-whiteColor hover:bg-primaryColor dark:bg-whitegrey2-dark dark:text-blackColor2-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor rounded"
                      >
                        <i className="icofont-instagram"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://x.com/"
                        className="w-38px h-38px leading-38px text-center text-blackColor2 bg-whitegrey2 hover:text-whiteColor hover:bg-primaryColor dark:bg-whitegrey2-dark dark:text-blackColor2-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor rounded"
                      >
                        <i className="icofont-twitter"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.linkedin.com/"
                        className="w-38px h-38px leading-38px text-center text-blackColor2 bg-whitegrey2 hover:text-whiteColor hover:bg-primaryColor dark:bg-whitegrey2-dark dark:text-blackColor2-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor rounded"
                      >
                        <i className="icofont-linkedin"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZoomMeetingsDetails;
