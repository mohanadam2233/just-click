"use client";

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
// Cache helpers: new /features/course keys
// =====================================================

function invalidateNewCourses(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.courses.root(),
  });
}

function invalidateNewCourseOfferings(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.courseOfferings.root(),
  });
}

function invalidateNewChapters(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.chapters.root(),
  });
}

function invalidateNewCourseDetail(queryClient, courseId) {
  if (!courseId) return;

  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.courses.detail(courseId),
  });
}

function removeNewCourseDetail(queryClient, courseId) {
  if (!courseId) return;

  queryClient.removeQueries({
    queryKey: academicCourseKeys.courses.detail(courseId),
  });
}

function invalidateNewCourseOfferingDetail(queryClient, offeringId) {
  if (!offeringId) return;

  queryClient.invalidateQueries({
    queryKey: academicCourseKeys.courseOfferings.detail(offeringId),
  });
}

function removeNewCourseOfferingDetail(queryClient, offeringId) {
  if (!offeringId) return;

  queryClient.removeQueries({
    queryKey: academicCourseKeys.courseOfferings.detail(offeringId),
  });
}

function removeNewChapterDetail(queryClient, chapterId) {
  if (!chapterId) return;

  queryClient.removeQueries({
    queryKey: academicCourseKeys.chapters.detail(chapterId),
  });
}

function invalidateNewAcademicCourseTree(queryClient) {
  invalidateNewCourses(queryClient);
  invalidateNewCourseOfferings(queryClient);
  invalidateNewChapters(queryClient);
}

// =====================================================
// Cache helpers: old /features/academic keys
// These are needed because pages still use old useCourseDetail/useCoursesList.
// =====================================================

function invalidateOldCourses(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicKeys.courses.root(),
  });

  queryClient.invalidateQueries({
    queryKey: academicKeys.courses.lists(),
  });

  queryClient.invalidateQueries({
    queryKey: academicKeys.courses.dropdowns(),
  });
}

function invalidateOldCourseDetail(queryClient, courseId) {
  if (!courseId) return;

  queryClient.invalidateQueries({
    queryKey: academicKeys.courses.detail(courseId),
  });
}

function removeOldCourseDetail(queryClient, courseId) {
  if (!courseId) return;

  queryClient.removeQueries({
    queryKey: academicKeys.courses.detail(courseId),
  });
}

function invalidateOldChapters(queryClient) {
  queryClient.invalidateQueries({
    queryKey: academicKeys.chapters.root(),
  });

  queryClient.invalidateQueries({
    queryKey: academicKeys.chapters.lists(),
  });

  queryClient.invalidateQueries({
    queryKey: academicKeys.chapters.dropdowns(),
  });
}

function invalidateOldAcademicCourseTree(queryClient, courseId) {
  invalidateOldCourses(queryClient);
  invalidateOldCourseDetail(queryClient, courseId);
  invalidateOldChapters(queryClient);
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
// Variable helpers
// =====================================================

function getCourseIdFromVariables(variables) {
  return (
    variables?.id ||
    variables?.course_id ||
    variables?.payload?.course_id ||
    variables?.payload?.course?.id ||
    variables?.payload?.id
  );
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
// Course hooks
// =====================================================

export function useCreateCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: academicCourseKeys.courses.create(),
    mutationFn: academicCourseApi.createCourse,

    onSuccess: (data, variables, context) => {
      invalidateAllCourseCaches(queryClient);
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
    mutationKey: academicCourseKeys.courses.mutations(),
    mutationFn: academicCourseApi.updateCourse,

    onSuccess: (data, variables, context) => {
      const courseId = getCourseIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient, courseId);

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
    mutationKey: academicCourseKeys.courses.mutations(),
    mutationFn: academicCourseApi.patchCourse,

    onSuccess: (data, variables, context) => {
      const courseId = getCourseIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient, courseId);

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
    mutationKey: academicCourseKeys.courses.mutations(),
    mutationFn: academicCourseApi.deleteCourse,

    onSuccess: (data, variables, context) => {
      const courseId = getCourseIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient, courseId);
      removeAllCourseDetails(queryClient, courseId);

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
      const courseId = getCourseIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient, courseId);

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
      const courseId = getCourseIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient, courseId);

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
    mutationKey: academicCourseKeys.courseOfferings.mutations(),
    mutationFn: academicCourseApi.updateCourseOffering,

    onSuccess: (data, variables, context) => {
      const offeringId = getOfferingIdFromVariables(variables);
      const courseId = getCourseIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient, courseId);
      invalidateNewCourseOfferingDetail(queryClient, offeringId);

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
    mutationKey: academicCourseKeys.courseOfferings.mutations(),
    mutationFn: academicCourseApi.patchCourseOffering,

    onSuccess: (data, variables, context) => {
      const offeringId = getOfferingIdFromVariables(variables);
      const courseId = getCourseIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient, courseId);
      invalidateNewCourseOfferingDetail(queryClient, offeringId);

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
    mutationKey: academicCourseKeys.courseOfferings.mutations(),
    mutationFn: academicCourseApi.deleteCourseOffering,

    onSuccess: (data, variables, context) => {
      const offeringId = getOfferingIdFromVariables(variables);
      const courseId = getCourseIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient, courseId);
      removeNewCourseOfferingDetail(queryClient, offeringId);

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
    mutationKey: academicCourseKeys.chapters.mutations(),
    mutationFn: academicCourseApi.deleteChapter,

    onSuccess: (data, variables, context) => {
      const chapterId = getChapterIdFromVariables(variables);

      invalidateAllCourseCaches(queryClient);
      removeNewChapterDetail(queryClient, chapterId);

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
