"use client";

import accordions from "@/libs/accordions";
import Link from "next/link";
import { useEffect } from "react";

const CurriculumContent = () => {
  useEffect(() => {
    accordions();
  }, []);
  return (
    <div>
      <ul className="accordion-container curriculum">
        {/* accordion  */}
        <li className="accordion mb-25px overflow-hidden active">
          <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
            {/* controller  */}
            <div>
              <div className="cursor-pointer accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
                <div className="flex items-center">
                  <span>Intro Course content</span>
                  <p className="text-xs text-headingColor dark:text-headingColor-dark px-10px py-0.5 ml-10px bg-borderColor dark:bg-borderColor-dark rounded-full">
                    02hr 35min
                  </p>
                </div>
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
              </div>
            </div>
            {/* content  */}
            <div className="accordion-content transition-all duration-500">
              <div className="content-wrapper p-10px md:px-30px">
                <ul>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                      <p>
                        <i className="icofont-clock-time"></i> 22 minutes
                      </p>
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
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-blackColor dark:text-blackColor-dark text-sm flex items-center">
                      <p>
                        <i className="icofont-clock-time"></i> 22 minutes
                      </p>
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
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-15px flex items-center justify-between flex-wrap">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-file-text mr-10px"></i>
                        <span className="font-medium">Lesson 03 Exam :</span>
                      </h4>
                    </div>
                    <div className="text-blackColor dark:text-blackColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"> </i> 20 Ques
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </li>
        {/* accordion  */}
        <li className="accordion mb-25px overflow-hidden">
          <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark">
            {/* controller  */}
            <div>
              <div className="cursor-pointer accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
                <div className="flex items-center">
                  <span>Course Fundamentals</span>
                  <p className="text-xs text-headingColor dark:text-headingColor-dark px-10px py-0.5 ml-10px bg-borderColor dark:bg-borderColor-dark rounded-full">
                    1hr 35min
                  </p>
                </div>
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
              </div>
            </div>
            {/* content  */}
            <div className="accordion-content transition-all duration-500 h-0">
              <div className="content-wrapper p-10px md:px-30px">
                <ul>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-15px flex items-center justify-between flex-wrap">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-file-text mr-10px"></i>
                        <span className="font-medium">Lesson 03 Exam :</span>
                      </h4>
                    </div>
                    <div className="text-blackColor dark:text-blackColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"> </i> 20 Ques
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </li>
        {/* accordion  */}
        <li className="accordion mb-25px overflow-hidden">
          <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark">
            {/* controller  */}
            <div>
              <div className="cursor-pointer accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
                <div className="flex items-center">
                  <span>Course Core Concept</span>
                  <p className="text-xs text-headingColor dark:text-headingColor-dark px-10px py-0.5 ml-10px bg-borderColor dark:bg-borderColor-dark rounded-full">
                    3hr 10min
                  </p>
                </div>
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
              </div>
            </div>
            {/* content  */}
            <div className="accordion-content transition-all duration-500 h-0">
              <div className="content-wrapper p-10px md:px-30px">
                <ul>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-15px flex items-center justify-between flex-wrap">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-file-text mr-10px"></i>
                        <span className="font-medium">Lesson 03 Exam :</span>
                      </h4>
                    </div>
                    <div className="text-blackColor dark:text-blackColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"> </i> 20 Ques
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </li>
        {/* accordion  */}
        <li className="accordion mb-25px overflow-hidden">
          <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark">
            {/* controller  */}
            <div>
              <div className="cursor-pointer accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
                <div className="flex items-center">
                  <span>Course Key Features</span>
                  <p className="text-xs text-headingColor dark:text-headingColor-dark px-10px py-0.5 ml-10px bg-borderColor dark:bg-borderColor-dark rounded-full">
                    2hr 10min
                  </p>
                </div>
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
              </div>
            </div>
            {/* content  */}
            <div className="accordion-content transition-all duration-500 h-0">
              <div className="content-wrapper p-10px md:px-30px">
                <ul>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-15px flex items-center justify-between flex-wrap">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-file-text mr-10px"></i>
                        <span className="font-medium">Lesson 03 Exam :</span>
                      </h4>
                    </div>
                    <div className="text-blackColor dark:text-blackColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"> </i> 20 Ques
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </li>
        {/* accordion  */}
        <li className="accordion mb-25px overflow-hidden">
          <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-b-md">
            {/* controller  */}
            <div>
              <div className="cursor-pointer accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
                <div className="flex items-center">
                  <span>Course Conclusion</span>
                  <p className="text-xs text-headingColor dark:text-headingColor-dark px-10px py-0.5 ml-10px bg-borderColor dark:bg-borderColor-dark rounded-full">
                    2hr 10min
                  </p>
                </div>
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
              </div>
            </div>
            {/* content  */}
            <div className="accordion-content transition-all duration-500 h-0">
              <div className="content-wrapper p-10px md:px-30px">
                <ul>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-video-alt mr-10px"></i>
                        <span className="font-medium">Video :</span>
                        Lorem ipsum dolor sit amet.
                      </h4>
                    </div>
                    <div className="text-contentColor dark:text-contentColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"></i>
                      </p>
                    </div>
                  </li>
                  <li className="py-15px flex items-center justify-between flex-wrap">
                    <div>
                      <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
                        <i className="icofont-file-text mr-10px"></i>
                        <span className="font-medium">Lesson 03 Exam :</span>
                      </h4>
                    </div>
                    <div className="text-blackColor dark:text-blackColor-dark text-sm">
                      <p>
                        <i className="icofont-lock"> </i> 20 Ques
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default CurriculumContent;
