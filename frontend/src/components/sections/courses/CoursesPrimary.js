"use client";
import { useSearchParams } from "next/navigation";
import TabButtonSecondary from "@/components/shared/buttons/TabButtonSecondary";
import CoursesGrid from "@/components/shared/courses/CoursesGrid";
import CoursesList from "@/components/shared/courses/CoursesList";
import Pagination from "@/components/shared/others/Pagination";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import useTab from "@/hooks/useTab";
import { useEffect, useRef, useState } from "react";
import getAllCourses from "@/libs/getAllCourses";
import Image from "next/image";
import Link from "next/link";
import NoData from "@/components/shared/others/NoData";
const sortInputs = [
  "Sort by New",
  "Title Ascending",
  "Title Descending",
  "Price Ascending",
  "Price Descending",
];
const coursesBeforeFilter = getAllCourses();
const getFilteredCoursesLength = (filterkey, filterValue) => {
  const filteredCoursesLength = coursesBeforeFilter?.filter(
    (course) => course[filterkey] === filterValue
  )?.length;
  return filteredCoursesLength;
};
const filterIputs = [
  {
    name: "Categories",
    inputs: [
      {
        name: "Art & Design",
        totalCount: getFilteredCoursesLength("categories", "Art & Design"),
      },
      {
        name: "Development",
        totalCount: getFilteredCoursesLength("categories", "Development"),
      },
      {
        name: "Lifestyle",
        totalCount: getFilteredCoursesLength("categories", "Lifestyle"),
      },
      {
        name: "Web Design",
        totalCount: getFilteredCoursesLength("categories", "Web Design"),
      },
      {
        name: "Business",
        totalCount: getFilteredCoursesLength("categories", "Business"),
      },
      {
        name: "Finance",
        totalCount: getFilteredCoursesLength("categories", "Finance"),
      },
      {
        name: "Personal Development",
        totalCount: getFilteredCoursesLength(
          "categories",
          "Personal Development"
        ),
      },
      {
        name: "Marketing",
        totalCount: getFilteredCoursesLength("categories", "Marketing"),
      },
      {
        name: "Photography",
        totalCount: getFilteredCoursesLength("categories", "Photography"),
      },
      {
        name: "Data Science",
        totalCount: getFilteredCoursesLength("categories", "Data Science"),
      },
      {
        name: "Health & Fitness",
        totalCount: getFilteredCoursesLength("categories", "Health & Fitness"),
      },
      {
        name: "Mobile Application",
        totalCount: getFilteredCoursesLength(
          "categories",
          "Mobile Application"
        ),
      },
    ],
  },
  {
    name: "Tag",
    inputs: [
      "Mechanic",
      "English",
      "Computer Science",
      "Data & Tech",
      "Ux Desgin",
    ],
  },
  {
    name: "Skill Level",
    inputs: ["All", "Fullstack", "English Learn", "Intermediate", "Wordpress"],
  },
];
// get all filtered courses
const getAllFilteredCourses = (filterableCourses, filterObject) => {
  const { currentCategories, currentTags, currentSkillLevel } = filterObject;
  const filteredCourses = filterableCourses?.filter(
    ({ categories, tag, skillLevel }) =>
      (!currentCategories?.length || currentCategories.includes(categories)) &&
      (!currentTags?.length || currentTags?.includes(tag)) &&
      (!currentSkillLevel?.length ||
        currentSkillLevel?.includes("All") ||
        currentSkillLevel?.includes(skillLevel))
  );
  return filteredCourses;
};
// get sorted courses
const getSortedCourses = (courses, sortInput) => {
  switch (sortInput) {
    case "Sort by New":
      return courses?.sort((a, b) => a?.date - b?.date);
    case "Title Ascending":
      return courses?.sort((a, b) => a?.title?.localeCompare(b?.title));
    case "Title Descending":
      return courses?.sort((a, b) => b?.title?.localeCompare(a?.title));
    case "Price Ascending":
      return courses?.sort((a, b) => a?.price - b?.price);
    case "Price Descending":
      return courses?.sort((a, b) => b?.price - a?.price);
  }
};
const CoursesPrimary = ({ isNotSidebar, isList, card }) => {
  const category = useSearchParams().get("category");
  const [currentCategories, setCurrentCategories] = useState([]);
  const [currentTags, setCurrentTags] = useState([]);
  const [currentSkillLevel, setCurrentSkillLevel] = useState([]);
  const [sortInput, setSortInput] = useState("Sort by New");
  const [isSearch, setIsSearch] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [searchCourses, setSearchCourses] = useState([]);
  const { currentIdx, setCurrentIdx, handleTabClick } = useTab();
  const [currentCourses, setCurrentCourses] = useState(null);
  const [skip, setSkip] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBlock, setIsBlog] = useState(false);
  const coursesRef = useRef(null);
  const serarchTimeoutRef = useRef(null);
  const filterObject = {
    currentCategories,
    currentTags,
    currentSkillLevel,
  };
  const coursesOnCategory = coursesBeforeFilter?.filter(({ categories }) =>
    categories.toLocaleLowerCase()?.includes(category?.split("_")?.join(" "))
  );
  console.log(category);
  const allFilteredCourses = category
    ? getAllFilteredCourses(coursesOnCategory, filterObject)
    : getAllFilteredCourses(coursesBeforeFilter, filterObject);
  const courses = category
    ? getSortedCourses(isSearch ? searchCourses : allFilteredCourses, sortInput)
    : getSortedCourses(
        isSearch ? searchCourses : allFilteredCourses,
        sortInput
      );
  const coursesString = JSON.stringify(courses);
  const totalCourses = courses?.length;
  const limit = 12;
  const totalPages = Math.ceil(totalCourses / limit);
  const paginationItems = [...Array(totalPages)];
  const handlePagesnation = (id) => {
    coursesRef.current.scrollIntoView({ behavior: "smooth" });
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
    // const currentButton = e?.target;
  };
  const tapButtons = [
    {
      name: <i className="icofont-layout"></i>,
      content: (
        <CoursesGrid isNotSidebar={isNotSidebar} courses={currentCourses} />
      ),
    },
    {
      name: <i className="icofont-listine-dots"></i>,
      content: (
        <CoursesList
          isNotSidebar={isNotSidebar}
          isList={isList}
          courses={currentCourses}
          card={card}
        />
      ),
    },
  ];
  useEffect(() => {
    const courses = JSON.parse(coursesString);

    const coursesToShow = [...courses].splice(skip, limit);
    setCurrentCourses(coursesToShow);
  }, [skip, limit, coursesString]);

  useEffect(() => {
    if (isList) {
      setCurrentIdx(1);
    }
  }, [isList, setCurrentIdx]);
  // handle filters
  const getCurrentFilterInputs = (input, ps) => {
    return input === "All" && !ps.includes("All")
      ? ["All"]
      : ![...ps]?.includes(input)
      ? [...ps.filter((pInput) => pInput !== "All"), input]
      : [...ps?.filter((pInput) => pInput !== input && pInput !== "All")];
  };
  const handleFilters = (name, input) => {
    setIsSearch(false);
    setSearchString("");
    switch (name) {
      case "Categories":
        return setCurrentCategories((ps) => getCurrentFilterInputs(input, ps));
      case "Tag":
        return setCurrentTags((ps) => getCurrentFilterInputs(input, ps));
      case "Skill Level":
        return setCurrentSkillLevel((ps) => getCurrentFilterInputs(input, ps));
    }
  };
  // handle serachProducts
  const handleSearchProducts = (e) => {
    setIsBlog(true);
    setCurrentCategories([]);
    setCurrentTags([]);
    setCurrentSkillLevel([]);
    const value = e.target.value;
    setSearchString(value.toLowerCase());
  };
  // start search
  const startSearch = () => {
    serarchTimeoutRef.current = setTimeout(() => {
      const searchText = new RegExp(searchString, "i");
      let searchCourses;
      if (searchString) {
        setIsBlog(true);

        searchCourses = coursesBeforeFilter?.filter(({ title }) =>
          searchText.test(title)
        );
      } else {
        searchCourses = [];
      }

      setSearchCourses(searchCourses);
    }, 200);
  };

  return (
    <div>
      <div
        className="container tab py-10 md:py-50px lg:py-60px 2xl:py-100px"
        ref={coursesRef}
      >
        {/* courses header  */}
        <div
          className="courses-header flex justify-between items-center flex-wrap px-13px py-5px border border-borderColor dark:border-borderColor-dark mb-30px gap-y-5"
          data-aos="fade-up"
        >
          <div>
            {currentCourses ? (
              <p className="text-blackColor dark:text-blackColor-dark">
                Showing {skip ? skip : skip + 1} -{" "}
                {skip + limit >= totalCourses ? totalCourses : skip + limit} of{" "}
                {totalCourses} Results
              </p>
            ) : (
              ""
            )}
          </div>
          <div className="flex items-center">
            <div className="tab-links transition-all duraton-300 text-contentColor dark:text-contentColor-dark flex gap-11px">
              {tapButtons?.map(({ name, content }, idx) => (
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
            isNotSidebar || category ? "" : "md:grid-cols-12"
          } gap-30px`}
        >
          {/* courses sidebar  */}
          {isNotSidebar ? (
            ""
          ) : !category ? (
            <div className="md:col-start-1 md:col-span-4 lg:col-span-3">
              <div className="flex flex-col ">
                {/* search input  */}
                <div
                  className="pt-30px pr-15px pl-10px pb-23px 2xl:pt-10 2xl:pr-25px 2xl:pl-5 2xl:pb-33px mb-30px border border-borderColor dark:border-borderColor-dark "
                  data-aos="fade-up"
                >
                  <h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold leading-30px mb-25px">
                    Search here
                  </h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsSearch(true);
                      setSearchString("");
                    }}
                    className="w-full px-4 py-10px text-sm text-blackColor dark:text-blackColor-dark bg-placeholder bg-opacity-5 dark:bg-lightGrey10-dark flex justify-center items-center leading-26px dark:border dark:border-whiteColor relative"
                  >
                    <input
                      onChange={handleSearchProducts}
                      onKeyDown={() => {
                        clearTimeout(serarchTimeoutRef.current);
                        setIsBlog(false);
                      }}
                      onBlur={() => setIsBlog(false)}
                      onKeyUp={startSearch}
                      type="text"
                      value={searchString}
                      placeholder="Search Produce"
                      className="placeholder:text-placeholder   dark:placeholder:text-[rgb(183, 183, 183)] bg-transparent focus:outline-none placeholder:opacity-80 w-full placeholder:font-medium  "
                    />
                    <button type="submit">
                      <i className="icofont-search-1 text-base"></i>
                    </button>
                    {searchCourses?.length ? (
                      <ul
                        className={`absolute  left-0 top-full transition-all opacity-0 ${
                          searchCourses?.length && isBlock
                            ? "visible opacity-100"
                            : "invisible"
                        }  flex flex-col  gap-y-1  border-b border-borderColor dark:border-borderColor-dark overflow-y-auto bg-whiteColor dark:bg-whiteColor-dark p-10px shadow-dropdown-card dark:shadow-brand-dark w-full rounded-b-md`}
                      >
                        {[...searchCourses]
                          ?.slice(0, 5)
                          .map(({ id, title, image, price }, idx) => (
                            <li
                              key={idx}
                              className="relative flex gap-x-1.5 items-center"
                            >
                              <Link href={`/courses/${id}`}>
                                <Image
                                  prioriy="false"
                                  placeholder="blur"
                                  src={image}
                                  alt="photo"
                                  className="w-12 py-[3px]"
                                />
                              </Link>
                              <div>
                                <Link
                                  href={`/courses/${id}`}
                                  className="text-xs md:text-sm text-darkblack hover:text-secondaryColor leading-4 block capitalize dark:text-darkblack-dark dark:hover:text-secondaryColor"
                                >
                                  {title.length > 16
                                    ? title.slice(0, 16) + "..."
                                    : title}
                                </Link>
                                <p className="text-size-10 text-darkblack leading-5 block pb-5px dark:text-darkblack-dark">
                                  <span className="text-secondaryColor">
                                    ${price.toFixed(2)}
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
                {/* categories  */}
                {filterIputs?.map(({ name, inputs }, idx) => (
                  <div
                    key={idx}
                    className="pt-30px pr-15px pl-10px pb-23px 2xl:pt-10 2xl:pr-25px 2xl:pl-5 2xl:pb-33px mb-30px border border-borderColor dark:border-borderColor-dark"
                    data-aos="fade-up"
                  >
                    <h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold leading-30px mb-15px">
                      {name}
                    </h4>
                    <ul
                      className={`flex flex-col  ${
                        name === "Categories"
                          ? "gap-y-4"
                          : name === "Tag"
                          ? "gap-y-23px"
                          : "gap-y-10px"
                      }`}
                    >
                      {name === "Categories"
                        ? inputs?.map(({ name: name2, totalCount }, idx1) => (
                            <li key={idx1}>
                              {" "}
                              <button
                                onClick={() => handleFilters(name, name2)}
                                className={`${
                                  currentCategories.includes(name2)
                                    ? "bg-primaryColor text-contentColor-dark "
                                    : "text-contentColor  dark:text-contentColor-dark hover:text-contentColor-dark hover:bg-primaryColor "
                                } text-sm font-medium px-13px py-2 border border-borderColor dark:border-borderColor-dark flex justify-between leading-7 transition-all duration-300 w-full`}
                              >
                                <span>
                                  {name2?.length > 18
                                    ? name2.slice(0, 12) + "."
                                    : name2}
                                </span>{" "}
                                <span>
                                  {totalCount < 10
                                    ? `0${totalCount}`
                                    : totalCount}
                                </span>
                              </button>
                            </li>
                          ))
                        : name === "Tag"
                        ? inputs?.map((input, idx1) => (
                            <li
                              key={idx + input}
                              className={`${
                                currentTags.includes(input)
                                  ? "text-primaryColor"
                                  : "text-contentColor hover:text-primaryColor dark:hover:text-primaryColor  dark:text-contentColor-dark"
                              }  text-size-15 font-medium  flex justify-between leading-26px group`}
                            >
                              <button
                                onClick={() => handleFilters(name, input)}
                                className="w-full flex items-center gap-11px"
                              >
                                <span
                                  className={`w-14px h-15px border  ${
                                    currentTags.includes(input)
                                      ? "bg-primaryColor border-primaryColor"
                                      : "border-darkdeep6  group-hover:bg-primaryColor group-hover:border-primaryColor"
                                  }  `}
                                ></span>
                                <span>{input}</span>
                              </button>
                            </li>
                          ))
                        : inputs?.map((input, idx1) => (
                            <li
                              key={idx1 + input}
                              className={`${
                                currentSkillLevel.includes(input)
                                  ? "text-primaryColor "
                                  : "text-contentColor dark:text-contentColor-dark  hover:text-primaryColor dark:hover:text-primaryColor "
                              } text-size-15 font-medium leading-26px`}
                            >
                              <button
                                onClick={() => handleFilters(name, input)}
                                className="w-full text-start "
                              >
                                {input}
                              </button>
                            </li>
                          ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            ""
          )}
          {/* courses main  */}
          <div
            className={`${
              isNotSidebar || category
                ? ""
                : "md:col-start-5 md:col-span-8 lg:col-start-4 lg:col-span-9"
            } space-y-[30px]`}
          >
            {currentCourses ? (
              <>
                <div className="tab-contents">
                  {tapButtons?.map(({ content }, idx) => (
                    <TabContentWrapper
                      key={idx}
                      isShow={idx === currentIdx ? true : false}
                    >
                      {content}
                    </TabContentWrapper>
                  ))}
                </div>

                {/* pagination  */}
                {totalCourses > 11 ? (
                  <Pagination
                    pages={paginationItems}
                    totalItems={totalCourses}
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
              <NoData message={"No Course"} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPrimary;
