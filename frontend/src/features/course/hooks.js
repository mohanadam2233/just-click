// "use client";

import { academicKeys } from "@/features/academic/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { academicCourseApi } from "./api";
import { academicCourseKeys } from "./keys";

function callUserOnSuccess(options, data, variables, context) {
  if (typeof options?.onSuccess === "function") {
    options.onSuccess(data, variables, context);
  }
}

function callUserOnError(options, error, variables, context) {
  if (typeof options?.onError === "function") {
    options.onError(error, variables, context);
  }
}

// =====================================================
// Response helpers
// =====================================================

function unwrapData(res) {
  return res?.data?.data ?? res?.data ?? res ?? null;
}

function getCourseIdFromResponse(data) {
  const unwrapped = unwrapData(data);

  return (
    unwrapped?.course?.id ||
    unwrapped?.course?.course_id ||
    unwrapped?.id ||
    unwrapped?.course_id ||
    data?.course?.id ||
    data?.course?.course_id ||
    data?.id ||
    data?.course_id ||
    null
  );
}

function getCourseIdFromVariables(variables) {
  return (
    variables?.id ||
    variables?.course_id ||
    variables?.payload?.course_id ||
    variables?.payload?.course?.id ||
    variables?.payload?.id ||
    null
  );
}

function getFinalCourseId(data, variables) {
  return getCourseIdFromVariables(variables) || getCourseIdFromResponse(data);
}

function getOfferingIdFromVariables(variables) {
  return (
    variables?.id || variables?.offering_id || variables?.payload?.offering_id
  );
}

function getChapterIdFromVariables(variables) {
  return (
    variables?.id || variables?.chapter_id || variables?.payload?.chapter_id
  );
}

// =====================================================
// Cache patch helpers
// =====================================================

function patchCourseObject(course, courseId, patch = {}) {
  if (!course || typeof course !== "object") return course;

  const id = course.id ?? course.course_id;

  if (String(id) !== String(courseId)) return course;

  return {
    ...course,
    ...patch,
  };
}

function patchCourseRows(rows, courseId, patch = {}) {
  if (!Array.isArray(rows)) return rows;

  return rows.map((item) => patchCourseObject(item, courseId, patch));
}

function patchCourseListPayload(oldData, courseId, patch = {}) {
  if (!oldData) return oldData;

  // Shape: { data: { data: [...] } }
  if (Array.isArray(oldData?.data?.data)) {
    return {
      ...oldData,
      data: {
        ...oldData.data,
        data: patchCourseRows(oldData.data.data, courseId, patch),
      },
    };
  }

  // Shape: { data: [...] }
  if (Array.isArray(oldData?.data)) {
    return {
      ...oldData,
      data: patchCourseRows(oldData.data, courseId, patch),
    };
  }

  // Shape: { data: { data: { data: [...] } } }
  if (Array.isArray(oldData?.data?.data?.data)) {
    return {
      ...oldData,
      data: {
        ...oldData.data,
        data: {
          ...oldData.data.data,
          data: patchCourseRows(oldData.data.data.data, courseId, patch),
        },
      },
    };
  }

  // Shape: [...]
  if (Array.isArray(oldData)) {
    return patchCourseRows(oldData, courseId, patch);
  }

  return oldData;
}

function patchCourseDetailPayload(oldData, courseId, patch = {}) {
  if (!oldData) return oldData;

  // Shape: { data: { data: course } }
  if (oldData?.data?.data && typeof oldData.data.data === "object") {
    const current = oldData.data.data;
    const id = current.id ?? current.course_id;

    if (String(id) === String(courseId)) {
      return {
        ...oldData,
        data: {
          ...oldData.data,
          data: {
            ...current,
            ...patch,
          },
        },
      };
    }
  }

  // Shape: { data: course }
  if (oldData?.data && typeof oldData.data === "object") {
    const current = oldData.data;
    const id = current.id ?? current.course_id;

    if (String(id) === String(courseId)) {
      return {
        ...oldData,
        data: {
          ...current,
          ...patch,
        },
      };
    }
  }

  // Shape: course
  if (oldData && typeof oldData === "object") {
    const id = oldData.id ?? oldData.course_id;

    if (String(id) === String(courseId)) {
      return {
        ...oldData,
        ...patch,
      };
    }
  }

  return oldData;
}

function patchAllCourseCaches(queryClient, courseId, patch = {}) {
  if (!courseId || !patch || Object.keys(patch).length === 0) return;

  // New feature/course list caches
  queryClient.setQueriesData(
    {
      queryKey: academicCourseKeys.courses.lists(),
      exact: false,
    },
    (oldData) => patchCourseListPayload(oldData, courseId, patch),
  );

  queryClient.setQueriesData(
    {
      queryKey: academicCourseKeys.courses.infiniteLists(),
      exact: false,
    },
    (oldData) => patchCourseListPayload(oldData, courseId, patch),
  );

  queryClient.setQueriesData(
    {
      queryKey: academicCourseKeys.courses.details(),
      exact: false,
    },
    (oldData) => patchCourseDetailPayload(oldData, courseId, patch),
  );

  // Old feature/academic list caches
  queryClient.setQueriesData(
    {
      queryKey: academicKeys.courses.lists(),
      exact: false,
    },
    (oldData) => patchCourseListPayload(oldData, courseId, patch),
  );

  queryClient.setQueriesData(
    {
      queryKey: academicKeys.courses.details(),
      exact: false,
    },
    (oldData) => patchCourseDetailPayload(oldData, courseId, patch),
  );

  queryClient.setQueriesData(
    {
      queryKey: academicKeys.courses.dropdowns(),
      exact: false,
    },
    (oldData) => patchCourseListPayload(oldData, courseId, patch),
  );
}

function makeCoursePatchFromVariablesAndResponse(data, variables) {
  const unwrapped = unwrapData(data);
  const responseCourse = unwrapped?.course || unwrapped || {};

  const payload = variables?.payload || {};

  return {
    ...(payload.title !== undefined
      ? { title: payload.title }
      : responseCourse.title !== undefined
        ? { title: responseCourse.title }
        : {}),

    ...(payload.code !== undefined
      ? { code: payload.code }
      : responseCourse.code !== undefined
        ? { code: responseCourse.code }
        : {}),

    ...(payload.description !== undefined
      ? { description: payload.description }
      : responseCourse.description !== undefined
        ? { description: responseCourse.description }
        : {}),
  };
}

// =====================================================
// Cache invalidation helpers: new /features/course keys
// =====================================================

function invalidateNewCourses(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.courses.root(),
    exact: false,
  });
}

function invalidateNewCourseOfferings(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.courseOfferings.root(),
    exact: false,
  });
}

function invalidateNewChapters(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.chapters.root(),
    exact: false,
  });
}

function invalidateNewCourseDetail(queryClient, courseId) {
  if (!courseId) return;

  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.courses.detail(courseId),
    exact: false,
  });
}

function removeNewCourseDetail(queryClient, courseId) {
  if (!courseId) return;

  queryClient.removeQueries({
    queryKey: academicCourseKeys.courses.detail(courseId),
    exact: false,
  });
}

function invalidateNewCourseOfferingDetail(queryClient, offeringId) {
  if (!offeringId) return;

  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.courseOfferings.detail(offeringId),
    exact: false,
  });
}

function removeNewCourseOfferingDetail(queryClient, offeringId) {
  if (!offeringId) return;

  queryClient.removeQueries({
    queryKey: academicCourseKeys.courseOfferings.detail(offeringId),
    exact: false,
  });
}

function removeNewChapterDetail(queryClient, chapterId) {
  if (!chapterId) return;

  queryClient.removeQueries({
    queryKey: academicCourseKeys.chapters.detail(chapterId),
    exact: false,
  });
}

function invalidateNewAcademicCourseTree(queryClient) {
  invalidateNewCourses(queryClient);
  invalidateNewCourseOfferings(queryClient);
  invalidateNewChapters(queryClient);
}

// =====================================================
// Cache invalidation helpers: old /features/academic keys
// =====================================================

function invalidateOldCourses(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicKeys.courses.root(),
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: academicKeys.courses.lists(),
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: academicKeys.courses.dropdowns(),
    exact: false,
  });
}

function invalidateOldCourseDetail(queryClient, courseId) {
  if (!courseId) return;

  queryClient.invalidateQueries({
    queryKey: academicKeys.courses.detail(courseId),
    exact: false,
  });
}

function removeOldCourseDetail(queryClient, courseId) {
  if (!courseId) return;

  queryClient.removeQueries({
    queryKey: academicKeys.courses.detail(courseId),
    exact: false,
  });
}

function invalidateOldChapters(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicKeys.chapters.root(),
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: academicKeys.chapters.lists(),
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: academicKeys.chapters.dropdowns(),
    exact: false,
  });
}

function invalidateOldAcademicCourseTree(queryClient, courseId) {
  invalidateOldCourses(queryClient);
  invalidateOldCourseDetail(queryClient, courseId);
  invalidateOldChapters(queryClient);
}

// =====================================================
// Force refetch helpers
// =====================================================

function refetchAllCourseLists(queryClient) {
  queryClient.refetchQueries({
    queryKey: academicCourseKeys.courses.lists(),
    exact: false,
    type: "all",
  });

  queryClient.refetchQueries({
    queryKey: academicCourseKeys.courses.infiniteLists(),
    exact: false,
    type: "all",
  });

  queryClient.refetchQueries({
    queryKey: academicKeys.courses.lists(),
    exact: false,
    type: "all",
  });

  queryClient.refetchQueries({
    queryKey: academicKeys.courses.dropdowns(),
    exact: false,
    type: "all",
  });
}

// =====================================================
// Combined cache helpers
// =====================================================

function invalidateAllCourseCaches(queryClient, courseId) {
  invalidateNewAcademicCourseTree(queryClient);
  invalidateNewCourseDetail(queryClient, courseId);

  invalidateOldAcademicCourseTree(queryClient, courseId);
}

function removeAllCourseDetails(queryClient, courseId) {
  removeNewCourseDetail(queryClient, courseId);
  removeOldCourseDetail(queryClient, courseId);
}

// =====================================================
// Course hooks
// =====================================================

export function useCreateCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courses.create(),
    mutationFn: academicCourseApi.createCourse,

    onSuccess: (data, variables, context) => {
      const courseId = getFinalCourseId(data, variables);
      const patch = makeCoursePatchFromVariablesAndResponse(data, variables);

      patchAllCourseCaches(queryClient, courseId, patch);
      invalidateAllCourseCaches(queryClient, courseId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function useUpdateCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courses.update(),
    mutationFn: academicCourseApi.updateCourse,

    onSuccess: (data, variables, context) => {
      const courseId = getFinalCourseId(data, variables);
      const patch = makeCoursePatchFromVariablesAndResponse(data, variables);

      patchAllCourseCaches(queryClient, courseId, patch);
      invalidateAllCourseCaches(queryClient, courseId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function usePatchCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courses.update(),
    mutationFn: academicCourseApi.patchCourse,

    onSuccess: (data, variables, context) => {
      const courseId = getFinalCourseId(data, variables);
      const patch = makeCoursePatchFromVariablesAndResponse(data, variables);

      patchAllCourseCaches(queryClient, courseId, patch);
      invalidateAllCourseCaches(queryClient, courseId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function useDeleteCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courses.delete(),
    mutationFn: academicCourseApi.deleteCourse,

    onSuccess: (data, variables, context) => {
      const courseId = getFinalCourseId(data, variables);

      invalidateAllCourseCaches(queryClient, courseId);
      removeAllCourseDetails(queryClient, courseId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function useBulkDeleteCourses(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courses.bulkDelete(),
    mutationFn: academicCourseApi.bulkDeleteCourses,

    onSuccess: (data, variables, context) => {
      invalidateAllCourseCaches(queryClient);
      refetchAllCourseLists(queryClient);

      variables?.ids?.forEach((id) => {
        removeAllCourseDetails(queryClient, id);
      });

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

// =====================================================
// Course Offering hooks
// =====================================================

export function useCreateCourseOffering(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courseOfferings.create(),
    mutationFn: academicCourseApi.createCourseOffering,

    onSuccess: (data, variables, context) => {
      const courseId = getFinalCourseId(data, variables);

      invalidateAllCourseCaches(queryClient, courseId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function useCreateCourseOfferings(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courseOfferings.create(),
    mutationFn: academicCourseApi.createCourseOfferings,

    onSuccess: (data, variables, context) => {
      const courseId = getFinalCourseId(data, variables);

      invalidateAllCourseCaches(queryClient, courseId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function useUpdateCourseOffering(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courseOfferings.update(),
    mutationFn: academicCourseApi.updateCourseOffering,

    onSuccess: (data, variables, context) => {
      const offeringId = getOfferingIdFromVariables(variables);
      const courseId = getFinalCourseId(data, variables);

      invalidateAllCourseCaches(queryClient, courseId);
      invalidateNewCourseOfferingDetail(queryClient, offeringId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function usePatchCourseOffering(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courseOfferings.update(),
    mutationFn: academicCourseApi.patchCourseOffering,

    onSuccess: (data, variables, context) => {
      const offeringId = getOfferingIdFromVariables(variables);
      const courseId = getFinalCourseId(data, variables);

      invalidateAllCourseCaches(queryClient, courseId);
      invalidateNewCourseOfferingDetail(queryClient, offeringId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function useDeleteCourseOffering(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courseOfferings.delete(),
    mutationFn: academicCourseApi.deleteCourseOffering,

    onSuccess: (data, variables, context) => {
      const offeringId = getOfferingIdFromVariables(variables);
      const courseId = getFinalCourseId(data, variables);

      invalidateAllCourseCaches(queryClient, courseId);
      removeNewCourseOfferingDetail(queryClient, offeringId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function useBulkDeleteCourseOfferings(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courseOfferings.bulkDelete(),
    mutationFn: academicCourseApi.bulkDeleteCourseOfferings,

    onSuccess: (data, variables, context) => {
      invalidateAllCourseCaches(queryClient);
      refetchAllCourseLists(queryClient);

      variables?.ids?.forEach((id) => {
        removeNewCourseOfferingDetail(queryClient, id);
      });

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

// =====================================================
// Chapter hooks
// =====================================================

export function useDeleteChapter(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.chapters.delete(),
    mutationFn: academicCourseApi.deleteChapter,

    onSuccess: (data, variables, context) => {
      const chapterId = getChapterIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient);
      removeNewChapterDetail(queryClient, chapterId);
      refetchAllCourseLists(queryClient);

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}

export function useBulkDeleteChapters(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.chapters.bulkDelete(),
    mutationFn: academicCourseApi.bulkDeleteChapters,

    onSuccess: (data, variables, context) => {
      invalidateAllCourseCaches(queryClient);
      refetchAllCourseLists(queryClient);

      variables?.ids?.forEach((id) => {
        removeNewChapterDetail(queryClient, id);
      });

      callUserOnSuccess(options, data, variables, context);
    },

    onError: (error, variables, context) => {
      callUserOnError(options, error, variables, context);
    },

    ...options,
  });
}
