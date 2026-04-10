"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { academicApi } from "./api";
import { academicKeys } from "./keys";

function createHooks(
  entityKeys,
  api,
  listApiName,
  detailApiName,
  createApiName,
  updateApiName,
  deleteApiName,
  bulkDeleteApiName,
) {
  return {
    useDetail: (id, options = {}) =>
      useQuery({
        queryKey: entityKeys.detail(id),
        queryFn: () => api[detailApiName](id),
        enabled: !!id,
        ...options,
      }),
    useList: (params = {}, options = {}) =>
      useQuery({
        queryKey: entityKeys.list(params),
        queryFn: () => api[listApiName](params),
        ...options,
      }),
    useInfiniteList: (baseParams = {}, options = {}) =>
      useInfiniteQuery({
        queryKey: entityKeys.list({
          ...baseParams,
          mode: "cursor",
          infinite: true,
        }),
        queryFn: ({ pageParam = "" }) =>
          api[listApiName]({
            ...baseParams,
            mode: "cursor",
            limit: 10,
            cursor: pageParam || undefined,
          }),
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
          const pagination = lastPage?.data?.pagination;
          if (pagination?.has_more && pagination?.next_cursor)
            return pagination.next_cursor;
          return undefined;
        },
        ...options,
      }),
    useCreate: (options = {}) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: api[createApiName],
        onSuccess: (data, variables, context) => {
          queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
          if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        ...options,
      });
    },
    useUpdate: (options = {}) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: api[updateApiName],
        onSuccess: (data, variables, context) => {
          const id = variables?.id;
          queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
          if (id)
            queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) });
          if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        ...options,
      });
    },
    useDelete: (options = {}) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: api[deleteApiName],
        onSuccess: (data, id, context) => {
          queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
          queryClient.removeQueries({ queryKey: entityKeys.detail(id) });
          if (options.onSuccess) options.onSuccess(data, id, context);
        },
        ...options,
      });
    },
    useBulkDelete: (options = {}) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: api[bulkDeleteApiName],
        onSuccess: (data, variables, context) => {
          queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
          variables?.ids?.forEach((id) =>
            queryClient.removeQueries({ queryKey: entityKeys.detail(id) }),
          );
          if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        ...options,
      });
    },
  };
}

// =======================
// EXPORT HOOKS PER ENTITY
// =======================

// 1. Faculties
const facultiesGeneric = createHooks(
  academicKeys.faculties,
  academicApi,
  "getFacultiesList",
  "getFaculty",
  "createFaculty",
  "updateFaculty",
  "deleteFaculty",
  "bulkDeleteFaculties",
);
export const {
  useDetail: useFacultyDetail,
  useList: useFacultiesList,
  useInfiniteList: useInfiniteFacultiesList,
  useCreate: useCreateFaculty,
  useUpdate: useUpdateFaculty,
  useDelete: useDeleteFaculty,
  useBulkDelete: useBulkDeleteFaculties,
} = facultiesGeneric;

export const useFacultiesDropdown = (params = {}, options = {}) =>
  useQuery({
    queryKey: academicKeys.faculties.dropdown(params),
    queryFn: () => academicApi.getFacultiesDropdown(params),
    ...options,
  });

export const usePublicFacultiesDropdown = (params = {}, options = {}) =>
  useQuery({
    queryKey: ["academic", "public", "faculties", "dropdown", params],
    queryFn: () => academicApi.getPublicFacultiesDropdown(params),
    ...options,
  });

export const usePublicFacultiesWithDepartmentsDropdown = (
  params = {},
  options = {},
) =>
  useQuery({
    queryKey: [
      "academic",
      "public",
      "faculties-with-departments",
      "dropdown",
      params,
    ],
    queryFn: () =>
      academicApi.getPublicFacultiesWithDepartmentsDropdown(params),
    ...options,
  });

export const usePublicDepartmentsDropdown = (params = {}, options = {}) =>
  useQuery({
    queryKey: ["academic", "public", "departments", "dropdown", params],
    queryFn: () => academicApi.getPublicDepartmentsDropdown(params),
    ...options,
  });

// 2. Departments
const departmentsGeneric = createHooks(
  academicKeys.departments,
  academicApi,
  "getDepartmentsList",
  "getDepartment",
  "createDepartment",
  "updateDepartment",
  "deleteDepartment",
  "bulkDeleteDepartments",
);
export const {
  useDetail: useDepartmentDetail,
  useList: useDepartmentsList,
  useInfiniteList: useInfiniteDepartmentsList,
  useCreate: useCreateDepartment,
  useUpdate: useUpdateDepartment,
  useDelete: useDeleteDepartment,
  useBulkDelete: useBulkDeleteDepartments,
} = departmentsGeneric;

export const useDepartmentsDropdown = (params = {}, options = {}) =>
  useQuery({
    queryKey: academicKeys.departments.dropdown(params),
    queryFn: () => academicApi.getDepartmentsDropdown(params),
    ...options,
  });

// 3. Courses
const coursesGeneric = createHooks(
  academicKeys.courses,
  academicApi,
  "getCoursesList",
  "getCourse",
  "createCourse",
  "updateCourse",
  "deleteCourse",
  "bulkDeleteCourses",
);
export const {
  useDetail: useCourseDetail,
  useList: useCoursesList,
  useInfiniteList: useInfiniteCoursesList,
  useCreate: useCreateCourse,
  useUpdate: useUpdateCourse,
  useDelete: useDeleteCourse,
  useBulkDelete: useBulkDeleteCourses,
} = coursesGeneric;

export const useCoursesDropdown = (params = {}, options = {}) =>
  useQuery({
    queryKey: academicKeys.courses.dropdown(params),
    queryFn: () => academicApi.getCoursesDropdown(params),
    ...options,
  });

// 4. Chapters
const chaptersGeneric = createHooks(
  academicKeys.chapters,
  academicApi,
  "getChaptersList",
  "getChapter",
  "createChapter",
  "updateChapter",
  "deleteChapter",
  "bulkDeleteChapters",
);
export const {
  useDetail: useChapterDetail,
  useList: useChaptersList,
  useInfiniteList: useInfiniteChaptersList,
  useCreate: useCreateChapter,
  useUpdate: useUpdateChapter,
  useDelete: useDeleteChapter,
  useBulkDelete: useBulkDeleteChapters,
} = chaptersGeneric;

export const useChaptersDropdown = (params = {}, options = {}) =>
  useQuery({
    queryKey: academicKeys.chapters.dropdown(params),
    queryFn: () => academicApi.getChaptersDropdown(params),
    ...options,
  });

// 5. Semesters
const semestersGeneric = createHooks(
  academicKeys.semesters,
  academicApi,
  "getSemestersList",
  "getSemester",
  "createSemester",
  "updateSemester",
  "deleteSemester",
  "bulkDeleteSemesters",
);
export const {
  useDetail: useSemesterDetail,
  useList: useSemestersList,
  useInfiniteList: useInfiniteSemestersList,
  useCreate: useCreateSemester,
  useUpdate: useUpdateSemester,
  useDelete: useDeleteSemester,
  useBulkDelete: useBulkDeleteSemesters,
} = semestersGeneric;

export const useSemestersDropdown = (params = {}, options = {}) =>
  useQuery({
    queryKey: academicKeys.semesters.dropdown(params),
    queryFn: () => academicApi.getSemestersDropdown(params),
    ...options,
  });

// 6. Academic Years
const academicYearsGeneric = createHooks(
  academicKeys.academicYears,
  academicApi,
  "getAcademicYearsList",
  "getAcademicYear",
  "createAcademicYear",
  "updateAcademicYear",
  "deleteAcademicYear",
  "bulkDeleteAcademicYears",
);
export const {
  useDetail: useAcademicYearDetail,
  useList: useAcademicYearsList,
  useInfiniteList: useInfiniteAcademicYearsList,
  useCreate: useCreateAcademicYear,
  useUpdate: useUpdateAcademicYear,
  useDelete: useDeleteAcademicYear,
  useBulkDelete: useBulkDeleteAcademicYears,
} = academicYearsGeneric;
