import Image from "next/image";
import React from "react";
import eventImage5 from "@/assets/images/event/event__5.png";
import eventImage6 from "@/assets/images/event/event__6.png";
import eventDetails2 from "@/assets/images/icon/event__details__2.png";
import Link from "next/link";
const EventDetails = () => {
  return (
    <section>
      <div className="container py-50px md:py-70px lg:py-20 2xl:py-100px">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-30px">
          <div className="lg:col-start-1 lg:col-span-8 space-y-[35px]">
            {/* event heading  */}
            <div>
              <p
                className="text-sm text-whiteColor bg-indigo rounded leading-25px px-2 mb-30px inline-block"
                data-aos="fade-up"
              >
                Mechanical
              </p>
              <h3
                className="text-3xl md:text-size-40 leading-11 md:leading-13.5 text-blackColor dark:text-blackColor-dark mb-15px font-bold"
                data-aos="fade-up"
              >
                Become a product manager learn the Skills & job.
              </h3>
              <div className="flex flex-wrap items-center">
                <div
                  className="flex mr-26px md:mr-76px items-center"
                  data-aos="fade-up"
                >
                  <div className="flex-shrink-0 w-66px h-66px">
                    <Image src={eventImage5} alt="" placeholder="blur" />
                  </div>
                  <div>
                    <p className="text-base md:text-size-11 lg:text-base font-medium text-blackColor dark:text-blackColor-dark leading-19px">
                      Teacher:
                    </p>
                    <p className="text-sm md:text-xs lg:text-sm text-contentColor dark:text-contentColor-dark leading-4 mb-15px">
                      Elon Masksd
                    </p>
                  </div>
                </div>
                <div className="mr-26px md:mr-76px" data-aos="fade-up">
                  <div>
                    <p className="text-base md:text-size-11 lg:text-base font-medium text-blackColor dark:text-blackColor-dark leading-19px">
                      Last Update:
                    </p>
                    <p className="text-sm md:text-xs lg:text-sm text-contentColor dark:text-contentColor-dark leading-4 mb-15px">
                      July 24, 2024
                    </p>
                  </div>
                </div>
                <div className="mr-26px md:mr-76px" data-aos="fade-up">
                  <div>
                    <p className="text-base md:text-size-11 lg:text-base font-medium text-blackColor dark:text-blackColor-dark leading-19px">
                      Location:
                    </p>
                    <p className="text-sm md:text-xs lg:text-sm text-contentColor dark:text-contentColor-dark leading-4 mb-15px">
                      684 West College St. Sun City, USA
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* event 1  */}
            <div data-aos="fade-up" className="mt-35px mb-30px">
              {/* blog thumbnail  */}
              <div className="overflow-hidden relative mb-35px">
                <Image
                  src={eventImage6}
                  alt=""
                  className="w-full"
                  placeholder="blur"
                />
              </div>
              {/* blog content  */}
              <div>
                <h4
                  className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-30px"
                  data-aos="fade-up"
                >
                  Description
                </h4>
                <p
                  className="text-darkdeep4 mb-15px !leading-29px"
                  data-aos="fade-up"
                >
                  He legged it up the kyver have it mush super me old mucker
                  cheeky naff that are you taking the piss, blow off ruddy the
                  pub bite your arm off the wireless boot cor blimey guvnor
                  happy days bender what a load of rubbish, say cheers pardon me
                  horse play spiffing Why car boot gosh bubble and squeak.
                  Cheers Richard bugger show off show Que pick your nose and
                  blow off get stuffed mate chancer in my flat loo, bevvy
                  amongst hunky-dory bender bubb Matie and squeak me old mucker
                  vagabond, barmy spend a penny chimney pot young delinquent bum
                  bag the nancy arm knees chap, gosh nice one knees up the
                  wireless Charles such a fibber. Mush barmy bleeding Jeffrey
                  pardon nose barney grub loo cup of tea bubble and squeak
                  bugger all mate say, I bloke matie boy tickety-boo give us the
                  duff bugger lurgy wind up I {"don't"} want no agro.
                </p>

                <h4
                  className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-30px"
                  data-aos="fade-up"
                >
                  This event will allow participants to:
                </h4>
                <ul data-aos="fade-up">
                  <li>
                    <p className="text-contentColor dark:text-contentColor-dark mb-10px !leading-29px">
                      <i className="icofont-check text-primaryColor"></i>{" "}
                      {"Business's"} managers, leaders
                    </p>
                  </li>
                  <li>
                    <p className="text-contentColor dark:text-contentColor-dark mb-10px !leading-29px">
                      <i className="icofont-check text-primaryColor"></i>
                      Downloadable lectures, code and design assets for all
                      projects
                    </p>
                  </li>
                  <li>
                    <p className="text-contentColor dark:text-contentColor-dark mb-10px !leading-29px">
                      <i className="icofont-check text-primaryColor"></i> Anyone
                      who is finding a chance to get the promotion
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* blog sidebar  */}
          <div className="lg:col-start-9 lg:col-span-4">
            {/* enroll section  */}
            <div
              className="py-33px px-25px shadow-event mb-30px"
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
                  <Link
                    href="#"
                    className="uppercase text-sm font-semibold text-secondaryColor2 leading-27px px-2 bg-whitegrey1 dark:bg-whitegrey1-dark"
                  >
                    68% OFF
                  </Link>
                </div>
              </div>
              <ul>
                <li className="flex items-center gap-x-10px mb-25px pb-22px border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <svg
                      width="18"
                      height="19"
                      viewBox="0 0 18 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.0306 7.31951L10.2759 0.496974C9.92563 0.176359 9.46963 -0.000862647 8.997 3.15745e-06C8.52424 0.000848658 8.06889 0.179588 7.71964 0.50139L0.969643 7.3196C0.359786 7.98029 0.0142286 8.8461 0 9.74926V16.2142C0.00401786 16.8134 0.243082 17.3864 0.664972 17.8078C1.08685 18.2291 1.6569 18.4643 2.25 18.4616H15.75C16.3431 18.4643 16.9132 18.2291 17.335 17.8078C17.7569 17.3864 17.996 16.8133 18 16.2142V9.74926C17.9858 8.8461 17.6402 7.98029 17.0304 7.3196L17.0306 7.31951ZM7.50257 16.9464L7.51981 10.8858L10.8754 10.9054V16.9465L7.50257 16.9464ZM16.5004 16.2142C16.4967 16.4117 16.4159 16.5996 16.2753 16.7369C16.1346 16.874 15.946 16.9494 15.7504 16.9464H12.3754V10.9052C12.3749 10.4984 12.2147 10.1083 11.9299 9.82042C11.645 9.53278 11.2588 9.37094 10.856 9.37042H7.5198C7.11702 9.37092 6.7308 9.53276 6.44585 9.82042C6.16108 10.1082 6.00086 10.4983 6.00035 10.9052V16.9464H2.25035C2.05481 16.9494 1.86614 16.874 1.72552 16.7369C1.5849 16.5995 1.50403 16.4117 1.50035 16.2142V9.74922C1.51575 9.248 1.70309 8.76774 2.03071 8.39099L8.77642 1.57711H8.77626C8.84272 1.53044 8.92308 1.50829 9.00377 1.5142C9.08028 1.50828 9.15661 1.52892 9.22006 1.57271L15.9701 8.39092C16.2977 8.76768 16.4852 9.24794 16.5004 9.74915L16.5004 16.2142Z"
                        fill="#5F2DED"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-contentColor dark:text-contentColor-dark">
                      <span className="mr-7px text-blackColor dark:text-blackColor-dark">
                        End:
                      </span>
                      July 26, 2024 12:30 am
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-x-10px mb-25px pb-22px border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <svg
                      width="18"
                      height="19"
                      viewBox="0 0 18 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.0306 7.31951L10.2759 0.496974C9.92563 0.176359 9.46963 -0.000862647 8.997 3.15745e-06C8.52424 0.000848658 8.06889 0.179588 7.71964 0.50139L0.969643 7.3196C0.359786 7.98029 0.0142286 8.8461 0 9.74926V16.2142C0.00401786 16.8134 0.243082 17.3864 0.664972 17.8078C1.08685 18.2291 1.6569 18.4643 2.25 18.4616H15.75C16.3431 18.4643 16.9132 18.2291 17.335 17.8078C17.7569 17.3864 17.996 16.8133 18 16.2142V9.74926C17.9858 8.8461 17.6402 7.98029 17.0304 7.3196L17.0306 7.31951ZM7.50257 16.9464L7.51981 10.8858L10.8754 10.9054V16.9465L7.50257 16.9464ZM16.5004 16.2142C16.4967 16.4117 16.4159 16.5996 16.2753 16.7369C16.1346 16.874 15.946 16.9494 15.7504 16.9464H12.3754V10.9052C12.3749 10.4984 12.2147 10.1083 11.9299 9.82042C11.645 9.53278 11.2588 9.37094 10.856 9.37042H7.5198C7.11702 9.37092 6.7308 9.53276 6.44585 9.82042C6.16108 10.1082 6.00086 10.4983 6.00035 10.9052V16.9464H2.25035C2.05481 16.9494 1.86614 16.874 1.72552 16.7369C1.5849 16.5995 1.50403 16.4117 1.50035 16.2142V9.74922C1.51575 9.248 1.70309 8.76774 2.03071 8.39099L8.77642 1.57711H8.77626C8.84272 1.53044 8.92308 1.50829 9.00377 1.5142C9.08028 1.50828 9.15661 1.52892 9.22006 1.57271L15.9701 8.39092C16.2977 8.76768 16.4852 9.24794 16.5004 9.74915L16.5004 16.2142Z"
                        fill="#5F2DED"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-contentColor dark:text-contentColor-dark">
                      <span className="mr-7px text-blackColor dark:text-blackColor-dark">
                        Time:
                      </span>
                      10:45 AM-01:30 PM
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-x-10px mb-25px pb-22px border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <svg
                      width="18"
                      height="19"
                      viewBox="0 0 18 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.0306 7.31951L10.2759 0.496974C9.92563 0.176359 9.46963 -0.000862647 8.997 3.15745e-06C8.52424 0.000848658 8.06889 0.179588 7.71964 0.50139L0.969643 7.3196C0.359786 7.98029 0.0142286 8.8461 0 9.74926V16.2142C0.00401786 16.8134 0.243082 17.3864 0.664972 17.8078C1.08685 18.2291 1.6569 18.4643 2.25 18.4616H15.75C16.3431 18.4643 16.9132 18.2291 17.335 17.8078C17.7569 17.3864 17.996 16.8133 18 16.2142V9.74926C17.9858 8.8461 17.6402 7.98029 17.0304 7.3196L17.0306 7.31951ZM7.50257 16.9464L7.51981 10.8858L10.8754 10.9054V16.9465L7.50257 16.9464ZM16.5004 16.2142C16.4967 16.4117 16.4159 16.5996 16.2753 16.7369C16.1346 16.874 15.946 16.9494 15.7504 16.9464H12.3754V10.9052C12.3749 10.4984 12.2147 10.1083 11.9299 9.82042C11.645 9.53278 11.2588 9.37094 10.856 9.37042H7.5198C7.11702 9.37092 6.7308 9.53276 6.44585 9.82042C6.16108 10.1082 6.00086 10.4983 6.00035 10.9052V16.9464H2.25035C2.05481 16.9494 1.86614 16.874 1.72552 16.7369C1.5849 16.5995 1.50403 16.4117 1.50035 16.2142V9.74922C1.51575 9.248 1.70309 8.76774 2.03071 8.39099L8.77642 1.57711H8.77626C8.84272 1.53044 8.92308 1.50829 9.00377 1.5142C9.08028 1.50828 9.15661 1.52892 9.22006 1.57271L15.9701 8.39092C16.2977 8.76768 16.4852 9.24794 16.5004 9.74915L16.5004 16.2142Z"
                        fill="#5F2DED"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-contentColor dark:text-contentColor-dark">
                      <span className="mr-7px text-blackColor dark:text-blackColor-dark">
                        Venue:
                      </span>
                      New York, TX 82760, US
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-30px" data-aos="fade-up">
                <button
                  type="submit"
                  className="text-size-15 text-whiteColor bg-primaryColor px-14 py-10px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
                >
                  Enroll Now Course
                </button>
              </div>
            </div>
            {/* sponsored section  */}
            <div
              className="py-33px px-25px shadow-event mb-30px"
              data-aos="fade-up"
            >
              <h4 className="text-size-21 text-blackColor dark:text-blackColor-dark font-bold leading-25px">
                Sopnsored
              </h4>
              <div className="mt-25px mb-30px">
                <Image src={eventDetails2} alt="" />
              </div>
              <p className="text-contentColor dark:text-contentColor-dark font-semibold leading-19px mb-15px">
                Thomas R. Toe
              </p>
              <p className="text-sm text-contentColor dark:text-contentColor-dark font-medium leading-[17px]">
                <span className="text-blackColor dark:text-blackColor-dark">
                  Email:
                </span>
                Mirnsdomoham@gmail.com
              </p>

              <div>
                <ul className="flex gap-10px items-center mt-5">
                  <li>
                    <p className="text-xl font-semibold text-contentColor dark:text-contentColor-dark leading-6">
                      Share:
                    </p>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="w-10 h-9 leading-9 text-center text-skycolor bg-whitegrey2 hover:text-whiteColor hover:bg-primaryColor dark:bg-whitegrey2-dark dark:text-skycolor dark:hover:text-whiteColor dark:hover:bg-primaryColor rounded"
                    >
                      <i className="icofont-facebook"></i>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="w-10 h-9 leading-9 text-center text-skycolor bg-whitegrey2 hover:text-whiteColor hover:bg-primaryColor dark:bg-whitegrey2-dark dark:text-skycolor dark:hover:text-whiteColor dark:hover:bg-primaryColor rounded"
                    >
                      <i className="icofont-twitter"></i>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="w-10 h-9 leading-9 text-center text-deepred bg-whitegrey2 hover:text-whiteColor hover:bg-primaryColor dark:bg-whitegrey2-dark dark:text-deepred dark:hover:text-whiteColor dark:hover:bg-primaryColor rounded"
                    >
                      <i className="icofont-youtube-play"></i>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
