"use client";
import dashboardImage2 from "@/assets/images/dashbord/dashbord__2.jpg";
import teacherImage2 from "@/assets/images/teacher/teacher__2.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HeroDashboard = () => {
  const pathname = usePathname();
  const partOfPathNaem = pathname.split("/")[2].split("-")[0];
  const isAdmin = partOfPathNaem === "admin" ? true : false;
  const isInstructor = partOfPathNaem === "instructor" ? true : false;
  return (
    <section>
      <div className="container-fluid-2">
        <div
          className={`${
            isAdmin
              ? "bg-primaryColor"
              : isInstructor
              ? "bg-naveBlue"
              : "bg-skycolor"
          } p-5 md:p-10 rounded-5 flex justify-center md:justify-between items-center flex-wrap gap-2`}
        >
          <div className="flex items-center flex-wrap justify-center sm:justify-start">
            <div className="mr-10px lg:mr-5">
              <Image
                src={isAdmin || isInstructor ? dashboardImage2 : teacherImage2}
                alt=""
                className="w-27 h-27 md:w-22 md:h-22 lg:w-27 lg:h-27 rounded-full p-1 border-2 border-darkdeep7 box-content"
              />
            </div>{" "}
            {isAdmin || isInstructor ? (
              <div className="text-whiteColor font-bold text-center sm:text-start">
                <h5 className="text-xl leading-1.2 mb-5px">Hello</h5>
                <h2 className="text-2xl leading-1.24">Michle Obema</h2>
              </div>
            ) : (
              <div className="text-whiteColor font-bold text-center sm:text-start">
                <h5 className="text-2xl leading-1.24 mb-5px">Dond Tond</h5>
                <ul className="flex items-center gap-15px">
                  <li className="text-sm font-normal flex items-center gap-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-book-open mr-0.5"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>{" "}
                    9 Courses Enroled
                  </li>
                  <li className="text-sm font-normal flex items-center gap-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-award"
                    >
                      <circle cx="12" cy="8" r="7"></circle>
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                    </svg>
                    8 Certificate
                  </li>
                </ul>
              </div>
            )}
          </div>
          {isAdmin || isInstructor ? (
            <div className="text-center">
              <div className="text-yellow">
                {" "}
                <i className="icofont-star"></i>{" "}
                <i className="icofont-star"></i>{" "}
                <i className="icofont-star"></i>{" "}
                <i className="icofont-star"></i>{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-star inline-block"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <p className="text-whiteColor">4.0 (120 Reviews)</p>
            </div>
          ) : (
            ""
          )}
          <div>
            <Link
              href={`/dashboards/create-course`}
              className={`text-size-15 border text-whiteColor   ${
                isAdmin
                  ? "bg-primaryColor border-whiteColor hover:text-primaryColor  "
                  : isInstructor
                  ? "bg-primaryColor  border-primaryColor hover:text-primaryColor "
                  : "bg-secondaryColor border-secondaryColor hover:text-secondaryColor"
              }  px-25px py-10px hover:bg-whiteColor rounded group text-nowrap flex gap-1 items-center`}
            >
              {isAdmin || isInstructor
                ? " Create a New Course"
                : "Enroll A New Course "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-arrow-right"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroDashboard;
