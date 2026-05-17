import { fetchJSON } from "@/lib/http";

const API_PREFIX = "/academic_courses";

function cleanParams(params = {}) {
  const cleaned = {};

  Object.entries(params || {}).forEach(([key, value]) => {
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

function ensureId(id, label = "id") {
  if (id === undefined || id === null || id === "") {
    throw new Error(`${label} is required.`);
  }

  return id;
}

function cleanObject(payload = {}) {
  const cleaned = {};

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined) return;
    cleaned[key] = value;
  });

  return cleaned;
}

function jsonBody(payload = {}) {
  return JSON.stringify(cleanObject(payload));
}

function deleteBody(permanent = false) {
  return JSON.stringify({ permanent: Boolean(permanent) });
}

export const academicCourseApi = {
  // =====================================================
  // Courses
  // =====================================================

  /**
   * POST /api/academic_courses/courses/create
   *
   * Shape:
   * {
   *   title: string,
   *   code?: string,
   *   description?: string,
   *   is_enabled?: boolean,
   *   offerings?: CourseOfferingRow[]
   * }
   */
  createCourse: (payload) =>
    fetchJSON(`${API_PREFIX}/courses/create`, {
      method: "POST",
      body: jsonBody(payload),
    }),

  /**
   * PUT /api/academic_courses/courses/:id/update
   *
   * Shape:
   * {
   *   title?: string,
   *   code?: string,
   *   description?: string,
   *   is_enabled?: boolean,
   *   offerings?: CourseOfferingRow[]
   * }
   *
   * Important:
   * - If offerings key is missing, backend does not touch offerings.
   * - If offerings exists, it is treated as final active table.
   */
  updateCourse: ({ id, payload }) =>
    fetchJSON(`${API_PREFIX}/courses/${ensureId(id, "course id")}/update`, {
      method: "PUT",
      body: jsonBody(payload),
    }),

  /**
   * PATCH /api/academic_courses/courses/:id/update
   */
  patchCourse: ({ id, payload }) =>
    fetchJSON(`${API_PREFIX}/courses/${ensureId(id, "course id")}/update`, {
      method: "PATCH",
      body: jsonBody(payload),
    }),

  /**
   * DELETE /api/academic_courses/courses/:id/delete
   *
   * Shape:
   * {
   *   permanent?: boolean
   * }
   */
  deleteCourse: ({ id, permanent = false }) =>
    fetchJSON(`${API_PREFIX}/courses/${ensureId(id, "course id")}/delete`, {
      method: "DELETE",
      body: deleteBody(permanent),
    }),

  /**
   * POST /api/academic_courses/courses/bulk-delete
   *
   * Shape:
   * {
   *   ids: number[],
   *   permanent?: boolean
   * }
   */
  bulkDeleteCourses: ({ ids, permanent = false }) =>
    fetchJSON(`${API_PREFIX}/courses/bulk-delete`, {
      method: "POST",
      body: jsonBody({
        ids,
        permanent: Boolean(permanent),
      }),
    }),

  // =====================================================
  // Course Offerings
  // =====================================================

  /**
   * POST /api/academic_courses/course-offerings/create
   *
   * Single shape:
   * {
   *   course_id: number,
   *   department_id?: number,
   *   semester_id?: number,
   *   custom_title?: string,
   *   credit_hours?: number,
   *   is_enabled?: boolean,
   *   chapters?: CourseChapterRow[]
   * }
   *
   * Bulk shape:
   * {
   *   course_id: number,
   *   offerings: CourseOfferingRow[]
   * }
   */
  createCourseOffering: (payload) =>
    fetchJSON(`${API_PREFIX}/course-offerings/create`, {
      method: "POST",
      body: jsonBody(payload),
    }),

  createCourseOfferings: (payload) =>
    fetchJSON(`${API_PREFIX}/course-offerings/create`, {
      method: "POST",
      body: jsonBody(payload),
    }),

  /**
   * PUT /api/academic_courses/course-offerings/:id/update
   *
   * Shape:
   * {
   *   course_id?: number,
   *   department_id?: number,
   *   semester_id?: number,
   *   custom_title?: string,
   *   credit_hours?: number,
   *   is_enabled?: boolean,
   *   chapters?: CourseChapterRow[]
   * }
   *
   * Important:
   * - If chapters key is missing, backend does not touch chapters.
   * - If chapters exists, it is treated as final active table.
   */
  updateCourseOffering: ({ id, payload }) =>
    fetchJSON(
      `${API_PREFIX}/course-offerings/${ensureId(id, "course offering id")}/update`,
      {
        method: "PUT",
        body: jsonBody(payload),
      },
    ),

  /**
   * PATCH /api/academic_courses/course-offerings/:id/update
   */
  patchCourseOffering: ({ id, payload }) =>
    fetchJSON(
      `${API_PREFIX}/course-offerings/${ensureId(id, "course offering id")}/update`,
      {
        method: "PATCH",
        body: jsonBody(payload),
      },
    ),

  /**
   * DELETE /api/academic_courses/course-offerings/:id/delete
   *
   * Shape:
   * {
   *   permanent?: boolean
   * }
   */
  deleteCourseOffering: ({ id, permanent = false }) =>
    fetchJSON(
      `${API_PREFIX}/course-offerings/${ensureId(id, "course offering id")}/delete`,
      {
        method: "DELETE",
        body: deleteBody(permanent),
      },
    ),

  /**
   * POST /api/academic_courses/course-offerings/bulk-delete
   *
   * Shape:
   * {
   *   ids: number[],
   *   permanent?: boolean
   * }
   */
  bulkDeleteCourseOfferings: ({ ids, permanent = false }) =>
    fetchJSON(`${API_PREFIX}/course-offerings/bulk-delete`, {
      method: "POST",
      body: jsonBody({
        ids,
        permanent: Boolean(permanent),
      }),
    }),

  // =====================================================
  // Chapters
  // =====================================================

  /**
   * DELETE /api/academic_courses/chapters/:id/delete
   *
   * Shape:
   * {
   *   permanent?: boolean
   * }
   */
  deleteChapter: ({ id, permanent = false }) =>
    fetchJSON(`${API_PREFIX}/chapters/${ensureId(id, "chapter id")}/delete`, {
      method: "DELETE",
      body: deleteBody(permanent),
    }),

  /**
   * POST /api/academic_courses/chapters/bulk-delete
   *
   * Shape:
   * {
   *   ids: number[],
   *   permanent?: boolean
   * }
   */
  bulkDeleteChapters: ({ ids, permanent = false }) =>
    fetchJSON(`${API_PREFIX}/chapters/bulk-delete`, {
      method: "POST",
      body: jsonBody({
        ids,
        permanent: Boolean(permanent),
      }),
    }),

  // Export helper in case you later add list/detail routes.
  toQueryString,
};
