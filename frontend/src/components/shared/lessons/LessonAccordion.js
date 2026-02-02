"use client";
import accordions from "@/libs/accordions";
import Link from "next/link";
import React, { useEffect } from "react";

const LessonAccordion = ({ id }) => {
  useEffect(() => {
    accordions();
  }, []);
  return (
    <ul className="accordion-container curriculum">
      {/* accordion  */}
      <li className="accordion mb-25px overflow-hidden active">
        <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
          {/* controller  */}
          <div>
            <button className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
              <span>Lesson #01</span>

              <svg
                className="transition-all duration-500 rotate-0"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="#212529"
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                ></path>
              </svg>
            </button>
          </div>
          {/* content  */}
          <div className="accordion-content transition-all duration-500">
            <div className="content-wrapper p-10px md:px-30px">
              <ul>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href={`/lessons/1`}
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Intro
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">3.27</p>
                    <Link
                      href={`/lessons/1`}
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>

                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href={`/lessons/2`}
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Outline
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">5.00</p>
                    <Link
                      href={`/lessons/2`}
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>

                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-file-text mr-10px"></i>
                      <Link
                        href="/lesson-course-materials"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Materials
                      </Link>
                    </h4>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-audio mr-10px"></i>
                      <Link
                        href="/lesson-quiz"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Summer Quiz
                      </Link>
                    </h4>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-file-text mr-10px"></i>
                      <Link
                        href="/lesson-assignment"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Assignment
                      </Link>
                    </h4>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </li>
      <li className="accordion mb-25px overflow-hidden">
        <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark">
          {/* controller  */}
          <div>
            <button className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
              <span>Lesson #02</span>

              <svg
                className="transition-all duration-500 rotate-0"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="#212529"
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                ></path>
              </svg>
            </button>
          </div>
          {/* content  */}
          <div className="accordion-content transition-all duration-500 h-0">
            <div className="content-wrapper p-10px md:px-30px">
              <ul>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href="/lessons/1"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Intro
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">3.27</p>
                    <Link
                      href="/lessons/1"
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>

                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href="/lessons/2"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Outline
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">5.00</p>
                    <Link
                      href="/lessons/2"
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>

                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href="/lessons/3"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Outline
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">7.00</p>
                    <Link
                      href="/lessons/3"
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-file-text mr-10px"></i>
                      <Link
                        href="/lesson-course-materials"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Materials
                      </Link>
                    </h4>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-audio mr-10px"></i>
                      <Link
                        href="/lesson-quiz"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Summer Quiz
                      </Link>
                    </h4>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-file-text mr-10px"></i>
                      <Link
                        href="/lesson-assignment"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Assignment
                      </Link>
                    </h4>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </li>
      <li className="accordion mb-25px overflow-hidden">
        <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark">
          {/* controller  */}
          <div>
            <button className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
              <span>Lesson #03</span>

              <svg
                className="transition-all duration-500 rotate-0"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="#212529"
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                ></path>
              </svg>
            </button>
          </div>
          {/* content  */}
          <div className="accordion-content transition-all duration-500 h-0">
            <div className="content-wrapper p-10px md:px-30px">
              <ul>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href="/lessons/1"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Intro
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">3.27</p>
                    <Link
                      href="/lessons/1"
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>

                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href="/lessons/2"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Outline
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">5.00</p>
                    <Link
                      href="/lessons/2"
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>

                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href="/lessons/3"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Outline
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">7.00</p>
                    <Link
                      href="/lessons/3"
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-file-text mr-10px"></i>
                      <Link
                        href="/lesson-course-materials"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Materials
                      </Link>
                    </h4>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-audio mr-10px"></i>
                      <Link
                        href="/lesson-quiz"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Summer Quiz
                      </Link>
                    </h4>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-file-text mr-10px"></i>
                      <Link
                        href="/lesson-assignment"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Assignment
                      </Link>
                    </h4>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </li>
      <li className="accordion mb-25px overflow-hidden">
        <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-b-md">
          {/* controller  */}
          <div>
            <button className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
              <span>Lesson #04</span>

              <svg
                className="transition-all duration-500 rotate-0"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="#212529"
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                ></path>
              </svg>
            </button>
          </div>
          {/* content  */}
          <div className="accordion-content transition-all duration-500 h-0">
            <div className="content-wrapper p-10px md:px-30px">
              <ul>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href="/lessons/1"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Intro
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">3.27</p>
                    <Link
                      href="/lessons/1"
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>

                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href="/lessons/2"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Outline
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">5.00</p>
                    <Link
                      href="/lessons/2"
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>

                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-video-alt mr-10px"></i>
                      <Link
                        href="/lessons/3"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Outline
                      </Link>
                    </h4>
                  </div>
                  <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                    <p className="font-semibold">7.00</p>
                    <Link
                      href="/lessons/3"
                      className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5"
                    >
                      <p className="px-10px">
                        <i className="icofont-eye"></i> Preview
                      </p>
                    </Link>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-file-text mr-10px"></i>
                      <Link
                        href="/lesson-course-materials"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Course Materials
                      </Link>
                    </h4>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-audio mr-10px"></i>
                      <Link
                        href="/lesson-quiz"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Summer Quiz
                      </Link>
                    </h4>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between flex-wrap">
                  <div>
                    <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                      <i className="icofont-file-text mr-10px"></i>
                      <Link
                        href="/lesson-assignment"
                        className="font-medium text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover;text-primaryColor"
                      >
                        Assignment
                      </Link>
                    </h4>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </li>
    </ul>
  );
};

export default LessonAccordion;
