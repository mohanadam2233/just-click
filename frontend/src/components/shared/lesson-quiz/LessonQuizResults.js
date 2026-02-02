"use client";

import { useState } from "react";

const LessonQuizResults = ({ allResults, table, isHeading }) => {
  const [results, setResults] = useState(allResults);
  //   handle delete
  const handleDelete = (id) => {
    const remainedResults = [...results]?.filter(({ id: id1 }) => id1 !== id);
    setResults(remainedResults);
  };
  return (
    <div>
      {!isHeading ? (
        ""
      ) : (
        <h4 className="text-2xl sm:text-size-28 font-bold leading-1.2 text-blackColor dark:text-blackColor-dark mb-15px">
          Quiz Result
        </h4>
      )}
      <div className="overflow-auto">
        {!results?.length ? (
          <div className="h-10 flex items-center justify-center font-semibold text-lightGrey4 text-lg md:text-2xl">
            <p>No Result</p>
          </div>
        ) : (
          <table className="w-full text-left text-nowrap">
            <thead className="text-sm md:text-base text-blackColor dark:text-blackColor-dark bg-lightGrey5 dark:bg-whiteColor-dark leading-1.8 md:leading-1.8">
              <tr>
                <th className="px-5px py-10px md:px-5">
                  {table === 2 ? "Assignments" : "Quiz"}
                </th>
                {table === 2 ? (
                  ""
                ) : (
                  <th className="px-5px py-10px md:px-5">Qus</th>
                )}
                <th className="px-5px py-10px md:px-5">
                  {table === 2 ? "Total Marks" : "TM"}
                </th>
                <th className="px-5px py-10px md:px-5">
                  {" "}
                  {table === 2 ? "Total Submit" : "CA"}
                </th>
                {table === 2 ? (
                  ""
                ) : (
                  <th className="px-5px py-10px md:px-5">
                    {table === 2 ? "Status" : "Result"}
                  </th>
                )}
                <th className="px-5px py-10px md:px-5"></th>
              </tr>
            </thead>
            <tbody className="text-size-13 md:text-base text-contentColor dark:text-contentColor-dark font-normal">
              {results?.map(
                (
                  {
                    id,
                    date,
                    title,
                    studentName,
                    qus,
                    tm,
                    ca,
                    status,
                    totalSubmit,
                    courseName,
                    isView,
                    isDownload,
                    isSubmit,
                  },
                  idx
                ) => (
                  <tr
                    key={idx}
                    className={`leading-1.8 md:leading-1.8 ${
                      idx % 2 === 0
                        ? ""
                        : "bg-lightGrey5 dark:bg-whiteColor-dark"
                    }`}
                  >
                    <th className="px-5px py-10px md:px-5 font-normal">
                      {date ? <p>{date}</p> : ""}
                      <span className="text-blackColor dark:text-blackColor-dark font-bold">
                        {title}
                      </span>
                      <p>
                        {courseName ? "course: " : "Student: "}{" "}
                        <a
                          className="text-blackColor dark:text-blackColor-dark"
                          href="#"
                        >
                          {studentName || courseName}
                        </a>
                      </p>
                    </th>
                    {table === 2 ? (
                      ""
                    ) : (
                      <td className="px-5px py-10px md:px-5">
                        <p>{qus}</p>
                      </td>
                    )}
                    <td className="px-5px py-10px md:px-5">
                      <p>{tm}</p>
                    </td>
                    <td className="px-5px py-10px md:px-5">
                      <p>{totalSubmit || ca}</p>
                    </td>
                    {table === 2 ? (
                      ""
                    ) : (
                      <td className="px-5px py-10px md:px-5">
                        <p className="text-xs">
                          <span
                            className={` ${
                              status === "pass" || status === "running"
                                ? "bg-greencolor2"
                                : status === "time over"
                                ? "bg-primaryColor"
                                : status === "coming" || status === "processing"
                                ? "bg-skycolor"
                                : "bg-secondaryColor"
                            } h-22px inline-block px-7px  leading-22px font-bold text-whiteColor rounded-md capitalize`}
                          >
                            {status}
                          </span>
                        </p>
                      </td>
                    )}
                    <td className="px-5px py-10px md:px-5">
                      <div className="dashboard__button__group">
                        <a
                          className="flex items-center gap-1 text-sm font-bold text-whiteColor hover:text-primaryColor bg-primaryColor hover:bg-whiteColor dark:hover:bg-whiteColor-dark border border-primaryColor h-30px w-full px-14px leading-30px justify-center rounded-md my-5px"
                          href="#"
                        >
                          {" "}
                          {isView ? (
                            <>
                              <i className="icofont-eye"></i>
                              View
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-edit"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              Edit
                            </>
                          )}
                        </a>
                        <button
                          onClick={() =>
                            isSubmit ? () => {} : handleDelete(id)
                          }
                          className="flex items-center gap-1 text-sm font-bold text-whiteColor hover:text-secondaryColor bg-secondaryColor hover:bg-whiteColor dark:hover:bg-whiteColor-dark border border-secondaryColor h-30px w-full px-14px leading-30px justify-center rounded-md my-5px"
                        >
                          {isSubmit ? (
                            <>
                              <i className="icofont-paper-plane"></i>
                              Submit
                            </>
                          ) : (
                            <>
                              {" "}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-trash-2"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                              Delete
                            </>
                          )}
                        </button>

                        {isDownload ? (
                          <a
                            className="flex items-center gap-1 text-sm font-bold text-whiteColor hover:text-primaryColor bg-primaryColor hover:bg-whiteColor dark:hover:bg-whiteColor-dark border border-primaryColor h-30px w-full px-14px leading-30px justify-center rounded-md my-5px"
                            href="#"
                          >
                            <i className="icofont-download"></i>
                            Download
                          </a>
                        ) : (
                          ""
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LessonQuizResults;
