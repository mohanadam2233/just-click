import { fetchJSON } from "@/lib/http";

function cleanParams(params = {}) {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    cleaned[key] = value;
  });
  return cleaned;
}

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(cleanParams(params)).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const academicApi = {
  // --- Faculties ---
  createFaculty: (payload) =>
    fetchJSON("/academic/faculties/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateFaculty: ({ id, payload }) =>
    fetchJSON(`/academic/faculties/${id}/update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getFaculty: (id) =>
    fetchJSON(`/academic/faculties/${id}/get`, { method: "GET" }),
  getFacultiesList: (params) =>
    fetchJSON(`/academic/faculties/list${toQueryString(params)}`, {
      method: "GET",
    }),
  deleteFaculty: (id) =>
    fetchJSON(`/academic/faculties/${id}/delete`, { method: "DELETE" }),
  bulkDeleteFaculties: ({ ids }) =>
    fetchJSON("/academic/faculties/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  getFacultiesDropdown: (params) =>
    fetchJSON(`/academic/faculties/dropdown${toQueryString(params)}`, {
      method: "GET",
    }),
  // --- Public Dropdowns ---
  getPublicFacultiesDropdown: (params) =>
    fetchJSON(`/academic/public/faculties/dropdown${toQueryString(params)}`, {
      method: "GET",
    }),

  getPublicFacultiesWithDepartmentsDropdown: (params) =>
    fetchJSON(
      `/academic/public/faculties/with-departments/dropdown${toQueryString(params)}`,
      {
        method: "GET",
      },
    ),

  getPublicDepartmentsDropdown: (params) =>
    fetchJSON(`/academic/public/departments/dropdown${toQueryString(params)}`, {
      method: "GET",
    }),
  // --- Departments ---
  createDepartment: (payload) =>
    fetchJSON("/academic/departments/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateDepartment: ({ id, payload }) =>
    fetchJSON(`/academic/departments/${id}/update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getDepartment: (id) =>
    fetchJSON(`/academic/departments/${id}/get`, { method: "GET" }),
  getDepartmentsList: (params) =>
    fetchJSON(`/academic/departments/list${toQueryString(params)}`, {
      method: "GET",
    }),
  deleteDepartment: (id) =>
    fetchJSON(`/academic/departments/${id}/delete`, { method: "DELETE" }),
  bulkDeleteDepartments: ({ ids }) =>
    fetchJSON("/academic/departments/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  getDepartmentsDropdown: (params) =>
    fetchJSON(`/academic/departments/dropdown${toQueryString(params)}`, {
      method: "GET",
    }),

  // --- Courses ---
  createCourse: (payload) =>
    fetchJSON("/academic/courses/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCourse: ({ id, payload }) =>
    fetchJSON(`/academic/courses/${id}/update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getCourse: (id) =>
    fetchJSON(`/academic/courses/${id}/get`, { method: "GET" }),
  getCoursesList: (params) =>
    fetchJSON(`/academic/courses/list${toQueryString(params)}`, {
      method: "GET",
    }),
  deleteCourse: (id) =>
    fetchJSON(`/academic/courses/${id}/delete`, { method: "DELETE" }),
  bulkDeleteCourses: ({ ids }) =>
    fetchJSON("/academic/courses/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  getCoursesDropdown: (params) =>
    fetchJSON(`/academic/courses/dropdown${toQueryString(params)}`, {
      method: "GET",
    }),

  // --- Chapters ---
  createChapter: (payload) =>
    fetchJSON("/academic/chapters/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateChapter: ({ id, payload }) =>
    fetchJSON(`/academic/chapters/${id}/update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getChapter: (id) =>
    fetchJSON(`/academic/chapters/${id}/get`, { method: "GET" }),
  getChaptersList: (params) =>
    fetchJSON(`/academic/chapters/list${toQueryString(params)}`, {
      method: "GET",
    }),
  deleteChapter: (id) =>
    fetchJSON(`/academic/chapters/${id}/delete`, { method: "DELETE" }),
  bulkDeleteChapters: ({ ids }) =>
    fetchJSON("/academic/chapters/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  getChaptersDropdown: (params) =>
    fetchJSON(`/academic/chapters/dropdown${toQueryString(params)}`, {
      method: "GET",
    }),

  // --- Semesters ---
  createSemester: (payload) =>
    fetchJSON("/academic/semesters/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSemester: ({ id, payload }) =>
    fetchJSON(`/academic/semesters/${id}/update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getSemester: (id) =>
    fetchJSON(`/academic/semesters/${id}/get`, { method: "GET" }),
  getSemestersList: (params) =>
    fetchJSON(`/academic/semesters/list${toQueryString(params)}`, {
      method: "GET",
    }),
  deleteSemester: (id) =>
    fetchJSON(`/academic/semesters/${id}/delete`, { method: "DELETE" }),
  bulkDeleteSemesters: ({ ids }) =>
    fetchJSON("/academic/semesters/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  getSemestersDropdown: (params) =>
    fetchJSON(`/academic/semesters/dropdown${toQueryString(params)}`, {
      method: "GET",
    }),

  // --- Academic Years ---
  createAcademicYear: (payload) =>
    fetchJSON("/academic/years/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateAcademicYear: ({ id, payload }) =>
    fetchJSON(`/academic/years/${id}/update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getAcademicYear: (id) =>
    fetchJSON(`/academic/academic-years/${id}/get`, { method: "GET" }),
  getAcademicYearsList: (params) =>
    fetchJSON(`/academic/academic-years/list${toQueryString(params)}`, {
      method: "GET",
    }),
  deleteAcademicYear: (id) =>
    fetchJSON(`/academic/years/${id}/delete`, { method: "DELETE" }),
  bulkDeleteAcademicYears: ({ ids }) =>
    fetchJSON("/academic/years/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  // --- Course Offerings / Materials Dropdowns ---
  getCourseOfferingsMaterialDropdown: (params) =>
    fetchJSON(
      `/academic/course-offerings/material-dropdown${toQueryString(params)}`,
      {
        method: "GET",
      },
    ),

  getCourseOfferingChaptersDropdown: (courseOfferingId, params = {}) =>
    fetchJSON(
      `/academic/course-offerings/${courseOfferingId}/chapters/dropdown${toQueryString(params)}`,
      {
        method: "GET",
      },
    ),
};
