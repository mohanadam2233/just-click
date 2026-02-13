
// components/sections/courses/CoursesPrimary.jsx
"use client";
import { useSearchParams } from "next/navigation";
import TabButtonSecondary from "@/components/shared/buttons/TabButtonSecondary";
import CoursesGrid from "@/components/shared/courses/CoursesGrid";
import CoursesList from "@/components/shared/courses/CoursesList";
import Pagination from "@/components/shared/others/Pagination";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import useTab from "@/hooks/useTab";
import { useEffect, useRef, useState } from "react";
import getAllMaterials from "@/lib/getAllMaterials";
import Image from "next/image";
import Link from "next/link";
import NoData from "@/components/shared/others/NoData";

const sortInputs = [
  "Sort by New",
  "Title Ascending",
  "Title Descending",
];

const materialsBeforeFilter = getAllMaterials();

// Get unique semesters
const getUniqueSemesters = () => {
  const semesters = [...new Set(materialsBeforeFilter.map(m => m.semester))];
  return semesters.sort((a, b) => a - b);
};

// Get subjects for a specific semester
const getSubjectsBySemester = (semester) => {
  const subjects = [...new Set(
    materialsBeforeFilter
      .filter(m => m.semester === semester)
      .map(m => m.subject)
  )];
  return subjects;
};

const getFilteredMaterialsLength = (filterkey, filterValue) => {
  const filteredLength = materialsBeforeFilter?.filter(
    (material) => material[filterkey] === filterValue
  )?.length;
  return filteredLength;
};

// get all filtered materials
const getAllFilteredMaterials = (filterableMaterials, filterObject) => {
  const { currentSemesters, currentSubjects } = filterObject;
  const filteredMaterials = filterableMaterials?.filter(
    ({ semester, subject }) =>
      (!currentSemesters?.length || currentSemesters.includes(semester)) &&
      (!currentSubjects?.length || currentSubjects?.includes(subject))
  );
  return filteredMaterials;
};

// get sorted materials
const getSortedMaterials = (materials, sortInput) => {
  switch (sortInput) {
    case "Sort by New":
      return materials?.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    case "Title Ascending":
      return materials?.sort((a, b) => a?.title?.localeCompare(b?.title));
    case "Title Descending":
      return materials?.sort((a, b) => b?.title?.localeCompare(a?.title));
    default:
      return materials;
  }
};

const CoursesPrimary = ({ isNotSidebar, isList, card }) => {
  const semesterParam = useSearchParams().get("semester");
  const [currentSemesters, setCurrentSemesters] = useState(
    semesterParam ? [parseInt(semesterParam)] : []
  );
  const [currentSubjects, setCurrentSubjects] = useState([]);
  const [sortInput, setSortInput] = useState("Sort by New");
  const [isSearch, setIsSearch] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [searchMaterials, setSearchMaterials] = useState([]);
  const { currentIdx, setCurrentIdx, handleTabClick } = useTab();
  const [currentMaterials, setCurrentMaterials] = useState(null);
  const [skip, setSkip] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBlock, setIsBlog] = useState(false);
  const materialsRef = useRef(null);
  const serarchTimeoutRef = useRef(null);

  // Get available subjects based on selected semesters
  const availableSubjects = currentSemesters.length > 0
    ? [...new Set(
        materialsBeforeFilter
          .filter(m => currentSemesters.includes(m.semester))
          .map(m => m.subject)
      )]
    : [];

  const filterObject = {
    currentSemesters,
    currentSubjects,
  };

  const allFilteredMaterials = getAllFilteredMaterials(materialsBeforeFilter, filterObject);
  const materials = getSortedMaterials(isSearch ? searchMaterials : allFilteredMaterials, sortInput);

  const materialsString = JSON.stringify(materials);
  const totalMaterials = materials?.length || 0;
  const limit = 9;
  const totalPages = Math.ceil(totalMaterials / limit);
  const paginationItems = [...Array(totalPages)];

  const handlePagesnation = (id) => {
    materialsRef.current.scrollIntoView({ behavior: "smooth" });
    if (typeof id === "number") {
      setCurrentPage(id);
      setSkip(limit * id);
    } else if (id === "prev") {
      setCurrentPage(currentPage - 1);
      setSkip(skip - limit);
    } else if (id === "next") {
      setCurrentPage(currentPage + 1);
      setSkip(skip + limit);
    }
  };

  const tapButtons = [
    {
      name: <i className="icofont-layout"></i>,
      content: (
        <CoursesGrid isNotSidebar={isNotSidebar} materials={currentMaterials} />
      ),
    },
    {
      name: <i className="icofont-listine-dots"></i>,
      content: (
        <CoursesList
          isNotSidebar={isNotSidebar}
          isList={isList}
          materials={currentMaterials}
          card={card}
        />
      ),
    },
  ];

  useEffect(() => {
    const materials = JSON.parse(materialsString);
    const materialsToShow = [...materials].splice(skip, limit);
    setCurrentMaterials(materialsToShow);
  }, [skip, limit, materialsString]);

  useEffect(() => {
    if (isList) {
      setCurrentIdx(1);
    }
  }, [isList, setCurrentIdx]);

  // Reset subjects when semesters change
  useEffect(() => {
    setCurrentSubjects([]);
  }, [currentSemesters]);

  // handle filters
  const getCurrentFilterInputs = (input, ps) => {
    return ![...ps]?.includes(input)
      ? [...ps, input]
      : [...ps?.filter((pInput) => pInput !== input)];
  };

  const handleFilters = (name, input) => {
    setIsSearch(false);
    setSearchString("");
    switch (name) {
      case "Semester":
        return setCurrentSemesters((ps) => getCurrentFilterInputs(input, ps));
      case "Subject":
        return setCurrentSubjects((ps) => getCurrentFilterInputs(input, ps));
      default:
        break;
    }
  };

  // handle search
  const handleSearchMaterials = (e) => {
    setIsBlog(true);
    setCurrentSemesters([]);
    setCurrentSubjects([]);
    const value = e.target.value;
    setSearchString(value.toLowerCase());
  };

  const startSearch = () => {
    serarchTimeoutRef.current = setTimeout(() => {
      const searchText = new RegExp(searchString, "i");
      let searchResults;
      if (searchString) {
        setIsBlog(true);
        searchResults = materialsBeforeFilter?.filter(({ title }) =>
          searchText.test(title)
        );
      } else {
        searchResults = [];
      }
      setSearchMaterials(searchResults);
    }, 200);
  };

  return (
    <div>
      <div
        className="container tab py-10 md:py-50px lg:py-60px 2xl:py-100px"
        ref={materialsRef}
      >
        {/* materials header */}
        <div
          className="courses-header flex justify-between items-center flex-wrap px-13px py-5px border border-borderColor dark:border-borderColor-dark mb-30px gap-y-5"
          data-aos="fade-up"
        >
          <div>
            {currentMaterials ? (
              <p className="text-blackColor dark:text-blackColor-dark">
                Showing {skip ? skip + 1 : 1} -{" "}
                {skip + limit >= totalMaterials ? totalMaterials : skip + limit} of{" "}
                {totalMaterials} Results
              </p>
            ) : (
              ""
            )}
          </div>
          <div className="flex items-center">
            <div className="tab-links transition-all duration-300 text-contentColor dark:text-contentColor-dark flex gap-11px">
              {tapButtons?.map(({ name }, idx) => (
                <TabButtonSecondary
                  key={idx}
                  name={name}
                  button={"icon"}
                  currentIdx={currentIdx}
                  handleTabClick={handleTabClick}
                  idx={idx}
                />
              ))}
            </div>
            <div className="pl-50px sm:pl-20 pr-10px">
              <select
                className="text-blackColor bg-whiteColor py-2 pr-2 pl-3 rounded-md outline-none border-4 border-transparent focus:border-blue-light box-border"
                onChange={(e) => setSortInput(e.target.value)}
                value={sortInput}
              >
                {sortInputs.map((input, idx) => (
                  <option key={idx} value={input}>
                    {input}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 ${
            isNotSidebar ? "" : "md:grid-cols-12"
          } gap-30px`}
        >
          {/* materials sidebar */}
          {!isNotSidebar && (
            <div className="md:col-start-1 md:col-span-4 lg:col-span-3">
              <div className="flex flex-col">
                {/* search input */}
                <div
                  className="pt-30px pr-15px pl-10px pb-23px 2xl:pt-10 2xl:pr-25px 2xl:pl-5 2xl:pb-33px mb-30px border border-borderColor dark:border-borderColor-dark"
                  data-aos="fade-up"
                >
                  <h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold leading-30px mb-25px">
                    Search here
                  </h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsSearch(true);
                    }}
                    className="w-full px-4 py-10px text-sm text-blackColor dark:text-blackColor-dark bg-placeholder bg-opacity-5 dark:bg-lightGrey10-dark flex justify-center items-center leading-26px dark:border dark:border-whiteColor relative"
                  >
                    <input
                      onChange={handleSearchMaterials}
                      onKeyDown={() => {
                        clearTimeout(serarchTimeoutRef.current);
                        setIsBlog(false);
                      }}
                      onBlur={() => setIsBlog(false)}
                      onKeyUp={startSearch}
                      type="text"
                      value={searchString}
                      placeholder="Search materials..."
                      className="placeholder:text-placeholder dark:placeholder:text-[rgb(183,183,183)] bg-transparent focus:outline-none placeholder:opacity-80 w-full placeholder:font-medium"
                    />
                    <button type="submit">
                      <i className="icofont-search-1 text-base"></i>
                    </button>
                    {searchMaterials?.length ? (
                      <ul
                        className={`absolute left-0 top-full transition-all opacity-0 ${
                          searchMaterials?.length && isBlock
                            ? "visible opacity-100"
                            : "invisible"
                        } flex flex-col gap-y-1 border-b border-borderColor dark:border-borderColor-dark overflow-y-auto bg-whiteColor dark:bg-whiteColor-dark p-10px shadow-dropdown-card dark:shadow-brand-dark w-full rounded-b-md`}
                      >
                        {[...searchMaterials]?.slice(0, 5).map((material, idx) => (
                          <li
                            key={idx}
                            className="relative flex gap-x-1.5 items-center"
                          >
                            <div className="w-12 h-12 bg-primaryColor/10 flex items-center justify-center rounded">
                              <i className={`${material.fileType === 'pdf' ? 'icofont-file-pdf' : 'icofont-file-powerpoint'} text-2xl text-primaryColor`}></i>
                            </div>
                            <div>
                              <Link
                                href={`/materials/${material.id}`}
                                className="text-xs md:text-sm text-darkblack hover:text-secondaryColor leading-4 block capitalize dark:text-darkblack-dark dark:hover:text-secondaryColor"
                              >
                                {material.title.length > 16
                                  ? material.title.slice(0, 16) + "..."
                                  : material.title}
                              </Link>
                              <p className="text-size-10 text-darkblack leading-5 block pb-5px dark:text-darkblack-dark">
                                <span className="text-secondaryColor">
                                  Sem {material.semester}
                                </span>
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      ""
                    )}
                  </form>
                </div>

                {/* Semester Filter */}
                <div
                  className="pt-30px pr-15px pl-10px pb-23px 2xl:pt-10 2xl:pr-25px 2xl:pl-5 2xl:pb-33px mb-30px border border-borderColor dark:border-borderColor-dark"
                  data-aos="fade-up"
                >
                  <h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold leading-30px mb-15px">
                    Semester
                  </h4>
                  <ul className="flex flex-col gap-y-4">
                    {getUniqueSemesters().map((semester) => (
                      <li key={semester}>
                        <button
                          onClick={() => handleFilters("Semester", semester)}
                          className={`${
                            currentSemesters.includes(semester)
                              ? "bg-primaryColor text-contentColor-dark"
                              : "text-contentColor dark:text-contentColor-dark hover:text-contentColor-dark hover:bg-primaryColor"
                          } text-sm font-medium px-13px py-2 border border-borderColor dark:border-borderColor-dark flex justify-between leading-7 transition-all duration-300 w-full`}
                        >
                          <span>Semester {semester}</span>
                          <span>
                            {getFilteredMaterialsLength("semester", semester) < 10
                              ? `0${getFilteredMaterialsLength("semester", semester)}`
                              : getFilteredMaterialsLength("semester", semester)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subject Filter - Only shows when semesters are selected */}
                {currentSemesters.length > 0 && availableSubjects.length > 0 && (
                  <div
                    className="pt-30px pr-15px pl-10px pb-23px 2xl:pt-10 2xl:pr-25px 2xl:pl-5 2xl:pb-33px mb-30px border border-borderColor dark:border-borderColor-dark"
                    data-aos="fade-up"
                  >
                    <h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold leading-30px mb-15px">
                      Subject
                    </h4>
                    <ul className="flex flex-col gap-y-4">
                      {availableSubjects.map((subject) => (
                        <li key={subject}>
                          <button
                            onClick={() => handleFilters("Subject", subject)}
                            className={`${
                              currentSubjects.includes(subject)
                                ? "bg-primaryColor text-contentColor-dark"
                                : "text-contentColor dark:text-contentColor-dark hover:text-contentColor-dark hover:bg-primaryColor"
                            } text-sm font-medium px-13px py-2 border border-borderColor dark:border-borderColor-dark flex justify-between leading-7 transition-all duration-300 w-full`}
                          >
                            <span>{subject}</span>
                            <span>
                              {materialsBeforeFilter.filter(
                                m => currentSemesters.includes(m.semester) && m.subject === subject
                              ).length < 10
                                ? `0${materialsBeforeFilter.filter(
                                    m => currentSemesters.includes(m.semester) && m.subject === subject
                                  ).length}`
                                : materialsBeforeFilter.filter(
                                    m => currentSemesters.includes(m.semester) && m.subject === subject
                                  ).length}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* materials main */}
          <div
            className={`${
              isNotSidebar
                ? ""
                : "md:col-start-5 md:col-span-8 lg:col-start-4 lg:col-span-9"
            } space-y-[30px]`}
          >
            {currentMaterials ? (
              <>
                <div className="tab-contents">
                  {tapButtons?.map(({ content }, idx) => (
                    <TabContentWrapper
                      key={idx}
                      isShow={idx === currentIdx}
                    >
                      {content}
                    </TabContentWrapper>
                  ))}
                </div>

                {/* pagination */}
                {totalMaterials > limit ? (
                  <Pagination
                    pages={paginationItems}
                    totalItems={totalMaterials}
                    handlePagesnation={handlePagesnation}
                    currentPage={currentPage}
                    skip={skip}
                    limit={limit}
                  />
                ) : (
                  ""
                )}
              </>
            ) : (
              <NoData message={"No Materials Found"} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPrimary;