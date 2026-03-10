"use client";

import CoursesGrid from "@/components/shared/courses/CoursesGrid";
import CoursesList from "@/components/shared/courses/CoursesList";
import NoData from "@/components/shared/others/NoData";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import {
  useInfiniteMaterialsList,
  useMaterialFilterOptions,
} from "@/features/materials/hooks";
import {
  flattenInfiniteMaterials,
  mapMaterialToCardModel,
  sortMaterials,
} from "@/features/materials/utils";
import useIntersectionLoadMore from "@/hooks/useIntersectionLoadMore";
import useTab from "@/hooks/useTab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const sortInputs = ["Sort by New", "Title Ascending", "Title Descending"];

/* -------------------------------------------------------------------------- */
/*                             Skeleton Loaders                               */
/* -------------------------------------------------------------------------- */

const GridCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
    <div className="w-full h-40 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-4" />
    <div className="space-y-3">
      <div className="h-5 bg-gray-100 dark:bg-gray-700/50 rounded w-full" />
      <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-2/3" />
      <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-1/2" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 bg-gray-100 dark:bg-gray-700/50 rounded-full" />
        <div className="h-6 w-20 bg-gray-100 dark:bg-gray-700/50 rounded-full" />
      </div>
    </div>
  </div>
);

const ListRowSkeleton = () => (
  <div className="bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse flex flex-col sm:flex-row gap-4 items-start sm:items-center">
    <div className="w-full sm:w-32 h-24 bg-gray-100 dark:bg-gray-700/50 rounded-xl shrink-0" />
    <div className="flex-1 space-y-3 w-full">
      <div className="h-5 bg-gray-100 dark:bg-gray-700/50 rounded w-3/4" />
      <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-1/2" />
      <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-1/3" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-16 bg-gray-100 dark:bg-gray-700/50 rounded-full" />
        <div className="h-6 w-20 bg-gray-100 dark:bg-gray-700/50 rounded-full" />
      </div>
    </div>
  </div>
);

const GridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <GridCardSkeleton key={i} />
    ))}
  </div>
);

const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <ListRowSkeleton key={i} />
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                             Filter Components                              */
/* -------------------------------------------------------------------------- */

const formatCount = (count) => (count < 10 ? `0${count}` : `${count}`);

const FilterChip = ({ label, active, count, onClick, disabled }) => (
  <button
    type="button"
    onClick={!disabled ? onClick : undefined}
    disabled={disabled}
    className={`
      w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all mb-1
      ${
        active
          ? "bg-primaryColor text-white shadow-md shadow-primaryColor/20 dark:shadow-none"
          : "bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700/50"
      }
      ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    <span className="font-medium truncate">{label}</span>
    {count !== undefined && (
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
          active
            ? "bg-white/20 text-white"
            : "bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400"
        }`}
      >
        {formatCount(count)}
      </span>
    )}
  </button>
);

const FilterSection = ({ title, children, disabled = false, badge }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between px-1 mb-3">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        {title}
      </span>
      {badge && !disabled && (
        <span className="text-[9px] px-2 py-0.5 bg-primaryColor/10 text-primaryColor rounded-full font-bold">
          {badge}
        </span>
      )}
    </div>
    <div className={`space-y-1 ${disabled ? "opacity-50" : ""}`}>
      {children}
    </div>
  </div>
);

const ViewToggle = ({ currentIdx, onChange }) => (
  <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <button
      type="button"
      onClick={() => onChange(0)}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
        currentIdx === 0
          ? "bg-gray-100 dark:bg-gray-700 text-primaryColor shadow-sm"
          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      }`}
      aria-label="Grid view"
    >
      <i className="icofont-layout text-lg" />
    </button>

    <button
      type="button"
      onClick={() => onChange(1)}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
        currentIdx === 1
          ? "bg-gray-100 dark:bg-gray-700 text-primaryColor shadow-sm"
          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      }`}
      aria-label="List view"
    >
      <i className="icofont-listine-dots text-lg" />
    </button>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

const CoursesPrimary = ({ isNotSidebar, isList }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentIdx, setCurrentIdx } = useTab();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [selectedSemester, setSelectedSemester] = useState(
    searchParams.get("sem") ? Number(searchParams.get("sem")) : null,
  );
  const [selectedCourse, setSelectedCourse] = useState(
    searchParams.get("course") ? Number(searchParams.get("course")) : null,
  );
  const [selectedChapter, setSelectedChapter] = useState(
    searchParams.get("ch") ? Number(searchParams.get("ch")) : null,
  );
  const [searchString, setSearchString] = useState(searchParams.get("q") || "");
  const [sortInput, setSortInput] = useState(
    searchParams.get("sort") || "Sort by New",
  );

  useEffect(() => {
    if (isList) setCurrentIdx(1);
  }, [isList, setCurrentIdx]);

  const updateURL = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "") {
          params.delete(k);
        } else {
          params.set(k, String(v));
        }
      });

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    updateURL({
      sem: selectedSemester,
      course: selectedCourse,
      ch: selectedChapter,
      q: searchString || null,
      sort: sortInput !== "Sort by New" ? sortInput : null,
    });
  }, [
    selectedSemester,
    selectedCourse,
    selectedChapter,
    searchString,
    sortInput,
    updateURL,
  ]);

  const filterOptionsParams = useMemo(
    () => ({
      semester_id: selectedSemester || undefined,
      course_id: selectedCourse || undefined,
      chapter_id: selectedChapter || undefined,
    }),
    [selectedSemester, selectedCourse, selectedChapter],
  );

  const {
    data: filterOptionsResponse,
    isLoading: isFilterOptionsLoading,
    isFetching: isFilterOptionsFetching,
  } = useMaterialFilterOptions(filterOptionsParams, {
    staleTime: 1000 * 60 * 5,
  });

  const semesters = filterOptionsResponse?.data?.options?.semesters || [];
  const courses = filterOptionsResponse?.data?.options?.courses || [];
  const chapters = filterOptionsResponse?.data?.options?.chapters || [];

  const materialsParams = useMemo(
    () => ({
      mode: "cursor",
      limit: 10,
      semester_id: selectedSemester || undefined,
      course_id: selectedCourse || undefined,
      chapter_id: selectedChapter || undefined,
      search: searchString || undefined,
      is_enabled: true,
    }),
    [selectedSemester, selectedCourse, selectedChapter, searchString],
  );

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteMaterialsList(materialsParams, {
    staleTime: 1000 * 30,
  });

  const materials = useMemo(() => {
    const raw = flattenInfiniteMaterials(data?.pages || []);
    const mapped = raw.map(mapMaterialToCardModel);
    return sortMaterials(mapped, sortInput);
  }, [data?.pages, sortInput]);

  const totalCount =
    data?.pages?.[0]?.data?.meta?.total_count ?? materials.length;

  const hasActiveFilters =
    !!selectedSemester ||
    !!selectedCourse ||
    !!selectedChapter ||
    !!searchString;

  const activeFilterCount = [
    selectedSemester,
    selectedCourse,
    selectedChapter,
    searchString,
  ].filter(Boolean).length;

  const handleSemesterChange = (semId) => {
    const nextValue = selectedSemester === semId ? null : semId;
    setSelectedSemester(nextValue);
    setSelectedCourse(null);
    setSelectedChapter(null);
  };

  const handleCourseChange = (courseId) => {
    const nextValue = selectedCourse === courseId ? null : courseId;
    setSelectedCourse(nextValue);
    setSelectedChapter(null);
  };

  const handleChapterChange = (chapterId) => {
    const nextValue = selectedChapter === chapterId ? null : chapterId;
    setSelectedChapter(nextValue);
  };

  const clearAll = () => {
    setSelectedSemester(null);
    setSelectedCourse(null);
    setSelectedChapter(null);
    setSearchString("");
    setSortInput("Sort by New");
    setIsMobileFilterOpen(false);
    router.replace(pathname, { scroll: false });
  };

  const handleViewChange = (idx) => {
    setCurrentIdx(idx);
  };

  const loadMoreRef = useIntersectionLoadMore({
    enabled: true,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
  });

  const SidebarContent = ({ mobile = false }) => (
    <div className="space-y-4">
      {mobile && (
        <FilterSection title="View">
          <ViewToggle currentIdx={currentIdx} onChange={handleViewChange} />
        </FilterSection>
      )}

      <FilterSection title="Search">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search materials..."
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primaryColor/20 transition-all text-gray-700 dark:text-gray-200"
          />
          <i className="icofont-search-1 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primaryColor transition-colors" />
        </div>
      </FilterSection>

      <FilterSection
        title="Semester"
        badge={semesters.length ? `${semesters.length}` : undefined}
      >
        {isFilterOptionsLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {semesters.map((sem) => (
              <FilterChip
                key={sem.id}
                label={sem.label}
                count={sem.count}
                active={selectedSemester === sem.id}
                onClick={() => handleSemesterChange(sem.id)}
              />
            ))}
          </div>
        )}
      </FilterSection>

      <FilterSection
        title="Course"
        disabled={!selectedSemester}
        badge={courses.length ? `${courses.length}` : undefined}
      >
        {!selectedSemester ? (
          <div className="text-center py-4 text-xs font-medium text-gray-400 bg-white/50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-700/50">
            Select a semester first
          </div>
        ) : isFilterOptionsFetching ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {courses.length ? (
              courses.map((course) => (
                <FilterChip
                  key={course.id}
                  label={course.label}
                  count={course.count}
                  active={selectedCourse === course.id}
                  onClick={() => handleCourseChange(course.id)}
                />
              ))
            ) : (
              <div className="text-center py-4 text-xs font-medium text-gray-400 bg-white/50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-700/50">
                No courses found
              </div>
            )}
          </div>
        )}
      </FilterSection>

      <FilterSection
        title="Chapter"
        disabled={!selectedCourse}
        badge={chapters.length ? `${chapters.length}` : undefined}
      >
        {!selectedCourse ? (
          <div className="text-center py-4 text-xs font-medium text-gray-400 bg-white/50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-700/50">
            Select a course first
          </div>
        ) : isFilterOptionsFetching ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {chapters.length ? (
              chapters.map((chapter) => (
                <FilterChip
                  key={chapter.id}
                  label={chapter.label}
                  count={chapter.count}
                  active={selectedChapter === chapter.id}
                  onClick={() => handleChapterChange(chapter.id)}
                />
              ))
            ) : (
              <div className="text-center py-4 text-xs font-medium text-gray-400 bg-white/50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-700/50">
                No chapters found
              </div>
            )}
          </div>
        )}
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900 min-h-screen">
      <div className="container py-6 md:py-8 lg:py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5 bg-transparent">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Study Materials
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-gray-200/50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300">
                {totalCount} {totalCount === 1 ? "Result" : "Results"}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-wider transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              <i className="icofont-filter text-primaryColor" />
              <span className="text-gray-700 dark:text-gray-200">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-primaryColor text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="hidden lg:flex items-center gap-1 border-r border-gray-100 dark:border-gray-700 pr-2 mr-2">
                <ViewToggle
                  currentIdx={currentIdx}
                  onChange={handleViewChange}
                />
              </div>

              <div className="relative flex items-center h-9 px-1">
                <select
                  value={sortInput}
                  onChange={(e) => setSortInput(e.target.value)}
                  className="appearance-none text-sm font-medium bg-transparent text-gray-700 dark:text-gray-300 pl-3 pr-8 focus:outline-none cursor-pointer"
                >
                  {sortInputs.map((s) => (
                    <option key={s} value={s} className="dark:bg-gray-800">
                      {s}
                    </option>
                  ))}
                </select>
                <i className="icofont-rounded-down absolute right-3 text-gray-400 pointer-events-none text-sm" />
              </div>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedSemester && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm text-xs text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-primaryColor">
                  Semester
                </span>
                {semesters.find((s) => s.id === selectedSemester)?.label ||
                  selectedSemester}
                <button
                  type="button"
                  onClick={() => handleSemesterChange(selectedSemester)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <i className="icofont-close-line text-sm" />
                </button>
              </span>
            )}

            {selectedCourse && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm text-xs text-gray-700 dark:text-gray-300">
                {courses.find((c) => c.id === selectedCourse)?.label ||
                  selectedCourse}
                <button
                  type="button"
                  onClick={() => handleCourseChange(selectedCourse)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <i className="icofont-close-line text-sm" />
                </button>
              </span>
            )}

            {selectedChapter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm text-xs text-gray-700 dark:text-gray-300">
                {chapters.find((c) => c.id === selectedChapter)?.label ||
                  selectedChapter}
                <button
                  type="button"
                  onClick={() => handleChapterChange(selectedChapter)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <i className="icofont-close-line text-sm" />
                </button>
              </span>
            )}

            {searchString && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm text-xs text-gray-700 dark:text-gray-300">
                {searchString}
                <button
                  type="button"
                  onClick={() => setSearchString("")}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <i className="icofont-close-line text-sm" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
              <SidebarContent />
            </div>
          </aside>

          <main className="lg:col-span-9">
            {isLoading ? (
              currentIdx === 0 ? (
                <GridSkeleton />
              ) : (
                <ListSkeleton />
              )
            ) : materials.length > 0 ? (
              <div className="space-y-8">
                <div className="tab-contents">
                  <TabContentWrapper isShow={currentIdx === 0}>
                    <CoursesGrid
                      isNotSidebar={isNotSidebar}
                      materials={materials}
                    />
                  </TabContentWrapper>

                  <TabContentWrapper isShow={currentIdx === 1}>
                    <CoursesList materials={materials} />
                  </TabContentWrapper>
                </div>

                <div ref={loadMoreRef} className="h-2 w-full" />

                {isFetchingNextPage &&
                  (currentIdx === 0 ? (
                    <GridSkeleton count={3} />
                  ) : (
                    <ListSkeleton count={3} />
                  ))}

                {!hasNextPage && materials.length > 0 && (
                  <div className="text-center text-sm text-gray-400 py-6">
                    You have reached the end.
                  </div>
                )}
              </div>
            ) : (
              <NoData message="No materials found matching your filters." />
            )}

            {isFetching && !isLoading && !isFetchingNextPage && (
              <div className="mt-4 text-xs text-gray-400">Refreshing...</div>
            )}
          </main>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMobileFilterOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileFilterOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileFilterOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-[360px] bg-gray-50 dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="sticky top-0 flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <i className="icofont-filter text-primaryColor" />
              <h3 className="font-bold text-gray-900 dark:text-white">
                Filters
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <i className="icofont-close" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto h-[calc(100%-73px)]">
            <SidebarContent mobile />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full mt-8 py-3 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPrimary;
