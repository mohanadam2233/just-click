"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { peopleApi } from "./api";
import { peopleKeys } from "./keys";
import { fetchJSON } from "@/lib/http";

function createHooks(entityKeys, api, listApiName, detailApiName) {
  return {
    useDetail: (id, options = {}) => useQuery({
      queryKey: entityKeys.detail(id),
      queryFn: () => api[detailApiName](id),
      enabled: !!id,
      ...options,
    }),
    useList: (params = {}, options = {}) => useQuery({
      queryKey: entityKeys.list(params),
      queryFn: () => api[listApiName](params),
      ...options,
    }),
    useInfiniteList: (baseParams = {}, options = {}) => useInfiniteQuery({
      queryKey: entityKeys.list({ ...baseParams, mode: "scroll", infinite: true }),
      queryFn: ({ pageParam = 1 }) => api[listApiName]({ ...baseParams, mode: "scroll", limit: 20, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const pagination = lastPage?.data?.pagination;
        if (pagination?.has_more) return allPages.length + 1;
        return undefined;
      },
      ...options,
    })
  };
}

export const { 
    useDetail: useStudentDetail, 
    useList: useStudentsList, 
    useInfiniteList: useInfiniteStudentsList
} = createHooks(peopleKeys.students, peopleApi, "getStudentsList", "getStudent");

export const useUpdateStudent = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: peopleApi.updateStudent,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.students.lists() });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: peopleKeys.students.detail(variables.id) });
      }
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};

export const { 
    useDetail: useStaffDetail, 
    useList: useStaffList, 
    useInfiniteList: useInfiniteStaffList
} = createHooks(peopleKeys.staff, peopleApi, "getStaffList", "getStaff");

export const useUpdateStaff = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: peopleApi.updateStaff,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.staff.lists() });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: peopleKeys.staff.detail(variables.id) });
      }
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};

export const { 
    useDetail: useOnboardingDetail, 
    useList: useOnboardingList, 
    useInfiniteList: useInfiniteOnboardingList
} = createHooks(peopleKeys.onboarding, peopleApi, "getOnboardingList", "getOnboarding");

export const useApproveStudent = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetchJSON(`/education_people/students/${id}/approve`, { method: "POST" }),
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.onboarding.lists() });
      queryClient.invalidateQueries({ queryKey: peopleKeys.students.lists() });
      if (options.onSuccess) options.onSuccess(data, id, context);
    },
    ...options,
  });
};

export const useBulkApproveStudents = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => fetchJSON(`/education_people/students/bulk-approve`, { method: "POST", body: JSON.stringify({ user_ids: ids }) }),
    onSuccess: (data, ids, context) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.onboarding.lists() });
      queryClient.invalidateQueries({ queryKey: peopleKeys.students.lists() });
      if (options.onSuccess) options.onSuccess(data, ids, context);
    },
    ...options,
  });
};

export const useResendOutbox = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (outbox_id) => fetchJSON(`/education_people/email/outbox/${outbox_id}/resend`, { method: "POST" }),
    onSuccess: (data, outbox_id, context) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.onboarding.lists() });
      if (options.onSuccess) options.onSuccess(data, outbox_id, context);
    },
    ...options,
  });
};
