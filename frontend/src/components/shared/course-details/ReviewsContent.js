import Image from "next/image";
import React from "react";
import teacherImage1 from "@/assets/images/teacher/teacher__1.png";
import teacherImage2 from "@/assets/images/teacher/teacher__2.png";
import teacherImage3 from "@/assets/images/teacher/teacher__3.png";
const ReviewsContent = () => {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-x-30px gap-y-5">
        <div className="lg:col-start-1 lg:col-span-4 px-10px py-30px bg-whiteColor dark:bg-whiteColor-dark shadow-review text-center">
          <p className="text-7xl font-extrabold text-blackColor dark:text-blackColor-dark leading-90px">
            5.0
          </p>
          <div className="text-secondaryColor">
            {" "}
            <i className="icofont-star"></i> <i className="icofont-star"></i>{" "}
            <i className="icofont-star"></i> <i className="icofont-star"></i>{" "}
            <i className="icofont-star"></i>
          </div>
          <p className="text-blackColor dark:text-blackColor-dark leading-26px font-medium">
            (17 Reviews)
          </p>
        </div>
        {/* progress bar  */}
        <div className="lg:col-start-5 lg:col-span-8 px-15px">
          <ul className="flex flex-col gap-y-3">
            <li className="flex items-center text-blackColor dark:text-blackColor-dark">
              <div>
                <span>5</span>{" "}
                <span>
                  <i className="icofont-star text-secondaryColor"></i>
                </span>
              </div>
              <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
                <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
                <span className="absolute left-0 top-0 h-10px w-full bg-secondaryColor rounded-full"></span>
              </div>
              <div>
                <span>10</span>
              </div>
            </li>
            <li className="flex items-center text-blackColor dark:text-blackColor-dark">
              <div>
                <span>4</span>{" "}
                <span>
                  <i className="icofont-star text-secondaryColor"></i>
                </span>
              </div>
              <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
                <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
                <span className="absolute left-0 top-0 h-10px w-4/5 bg-secondaryColor rounded-full"></span>
              </div>
              <div>
                <span>5</span>
              </div>
            </li>
            <li className="flex items-center text-blackColor dark:text-blackColor-dark">
              <div>
                <span>3</span>{" "}
                <span>
                  <i className="icofont-star text-secondaryColor"></i>
                </span>
              </div>
              <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
                <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
                <span className="absolute left-0 top-0 h-10px w-60% bg-secondaryColor rounded-full"></span>
              </div>
              <div>
                <span>3</span>
              </div>
            </li>
            <li className="flex items-center text-blackColor dark:text-blackColor-dark">
              <div>
                <span>2</span>{" "}
                <span>
                  <i className="icofont-star text-secondaryColor"></i>
                </span>
              </div>
              <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
                <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
                <span className="absolute left-0 top-0 h-10px w-30% bg-secondaryColor rounded-full"></span>
              </div>
              <div>
                <span>2</span>
              </div>
            </li>
            <li className="flex items-center text-blackColor dark:text-blackColor-dark">
              <div>
                <span>1</span>{" "}
                <span>
                  <i className="icofont-star text-secondaryColor"></i>
                </span>
              </div>
              <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
                <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
                <span className="absolute left-0 top-0 h-10px w-10% bg-secondaryColor rounded-full"></span>
              </div>
              <div>
                <span>1</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      {/* client reviews  */}
      <div className="mt-60px mb-10">
        <h4 className="text-lg text-blackColor dark:text-blackColor-dark font-bold pl-2 before:w-0.5 relative before:h-[21px] before:bg-secondaryColor before:absolute before:bottom-[5px] before:left-0 leading-1.2 mb-25px">
          Customer Reviews
        </h4>
        <ul>
          <li className="flex gap-30px pt-35px border-t border-borderColor2 dark:border-borderColor2-dark">
            <div className="flex-shrink-0">
              <div>
                <Image
                  src={teacherImage2}
                  alt=""
                  className="w-25 h-25 rounded-full"
                />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <div>
                  <h4>
                    <a
                      href="#"
                      className="text-lg font-semibold text-blackColor hover:text-secondaryColor dark:text-blackColor-dark dark:hover:text-condaryColor leading-1.2"
                    >
                      Adam Smit
                    </a>
                  </h4>
                  <div className="text-secondaryColor leading-1.8">
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>
                  </div>
                </div>
                <div className="author__icon">
                  <p className="text-sm font-bold text-blackColor dark:text-blackColor-dark leading-9 px-25px mb-5px border-2 border-borderColor2 dark:border-borderColo2-dark hover:border-secondaryColor dark:hover:border-secondaryColor rounded-full transition-all duration-300">
                    September 2, 2024
                  </p>
                </div>
              </div>

              <p className="text-sm text-contentColor dark:text-contentColor-dark leading-23px mb-15px">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Doloribus, omnis fugit corporis iste magnam ratione.
              </p>
            </div>
          </li>
          <li className="flex gap-30px pt-35px border-t border-borderColor2 dark:border-borderColor2-dark">
            <div className="flex-shrink-0">
              <div>
                <Image
                  src={teacherImage1}
                  alt=""
                  className="w-25 h-25 rounded-full"
                />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <div>
                  <h4>
                    <a
                      href="#"
                      className="text-lg font-semibold text-blackColor hover:text-secondaryColor dark:text-blackColor-dark dark:hover:text-condaryColor leading-1.2"
                    >
                      Adam Smit
                    </a>
                  </h4>
                  <div className="text-secondaryColor leading-1.8">
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>
                  </div>
                </div>
                <div className="author__icon">
                  <p className="text-sm font-bold text-blackColor dark:text-blackColor-dark leading-9 px-25px mb-5px border-2 border-borderColor2 dark:border-borderColo2-dark hover:border-secondaryColor dark:hover:border-secondaryColor rounded-full transition-all duration-300">
                    September 2, 2024
                  </p>
                </div>
              </div>

              <p className="text-sm text-contentColor dark:text-contentColor-dark leading-23px mb-15px">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Doloribus, omnis fugit corporis iste magnam ratione.
              </p>
            </div>
          </li>
          <li className="flex gap-30px pt-35px border-t border-borderColor2 dark:border-borderColor2-dark">
            <div className="flex-shrink-0">
              <div>
                <Image
                  src={teacherImage3}
                  alt=""
                  className="w-25 h-25 rounded-full"
                />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <div>
                  <h4>
                    <a
                      href="#"
                      className="text-lg font-semibold text-blackColor hover:text-secondaryColor dark:text-blackColor-dark dark:hover:text-condaryColor leading-1.2"
                    >
                      Adam Smit
                    </a>
                  </h4>
                  <div className="text-secondaryColor leading-1.8">
                    {" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>{" "}
                    <i className="icofont-star"></i>
                  </div>
                </div>
                <div className="author__icon">
                  <p className="text-sm font-bold text-blackColor dark:text-blackColor-dark leading-9 px-25px mb-5px border-2 border-borderColor2 dark:border-borderColo2-dark hover:border-secondaryColor dark:hover:border-secondaryColor rounded-full transition-all duration-300">
                    September 2, 2024
                  </p>
                </div>
              </div>

              <p className="text-sm text-contentColor dark:text-contentColor-dark leading-23px mb-15px">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Doloribus, omnis fugit corporis iste magnam ratione.
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* add reviews  */}
      <div className="p-5 md:p-50px mb-50px bg-lightGrey12 dark:bg-transparent dark:shadow-brand-dark">
        <h4
          className="text-2xl font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-1.2"
          data-aos="fade-up"
        >
          Add a Review
        </h4>
        <div className="flex gap-15px items-center mb-30px">
          <h6 className="font-bold text-blackColor dark:text-blackColor-dark !leading-[19.2px]">
            Your Ratings:
          </h6>
          <div className="text-secondaryColor leading-1.8">
            <i className="icofont-star hover:text-primaryColor"></i>{" "}
            <i className="icofont-star hover:text-primaryColor"></i>{" "}
            <i className="icofont-star hover:text-primaryColor"></i>{" "}
            <i className="icofont-star hover:text-primaryColor"></i>{" "}
            <i className="icofont-star hover:text-primaryColor"></i>
          </div>
        </div>
        <form className="pt-5" data-aos="fade-up">
          <textarea
            placeholder="Type you comments...."
            className="w-full p-5 mb-8 bg-transparent text-sm text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-transparent dark:border-borderColor2-dark placeholder:text-placeholder k"
            cols="30"
            rows="6"
          />
          <div className="grid grid-cols-1 mb-10 gap-10">
            <input
              type="text"
              placeholder="Type your name...."
              className="w-full pl-5 bg-transparent text-sm focus:outline-none text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-transparent dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
            />
            <input
              type="email"
              placeholder="Type your email...."
              className="w-full pl-5 bg-transparent text-sm focus:outline-none text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-transparent dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
            />
          </div>

          <div className="grid grid-cols-1 mb-10 gap-10">
            <input
              type="text"
              placeholder="Type your website...."
              className="w-full pl-5 bg-transparent text-sm focus:outline-none text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark placeholder:text-placeholder border border-transparent dark:border-borderColor2-dark placeholder:opacity-80 h-15 leading-15 font-medium rounded"
            />
          </div>

          <div>
            <input type="checkbox" />{" "}
            <span className="text-size-15 text-darkBlue dark:text-darkBlue-dark">
              Save my name, email, and website in this browser for the next time
              I comment.
            </span>
          </div>
          <div className="mt-30px">
            <button
              type="submit"
              className="text-size-15 text-whiteColor bg-primaryColor px-25px py-10px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewsContent;
