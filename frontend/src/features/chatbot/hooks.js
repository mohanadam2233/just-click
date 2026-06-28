"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatbotApi } from "./api";
import { chatbotKeys } from "./keys";

function unwrapList(response) {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data) ? data : [];
}

function unwrapData(response) {
  return response?.data ?? response ?? null;
}

export const useChatbotSemesters = (options = {}) =>
  useQuery({
    queryKey: chatbotKeys.semesters(),
    queryFn: async () => unwrapList(await chatbotApi.getSemesters()),
    ...options,
  });

export const useChatbotSubjects = (semester, options = {}) =>
  useQuery({
    queryKey: chatbotKeys.subjects(semester),
    queryFn: async () => unwrapList(await chatbotApi.getSubjects(semester)),
    enabled: !!semester,
    ...options,
  });

export const useChatbotIndexStatus = (materialId, options = {}) =>
  useQuery({
    queryKey: chatbotKeys.indexStatus(materialId),
    queryFn: async () => unwrapData(await chatbotApi.getIndexStatus(materialId)),
    enabled: !!materialId,
    refetchInterval: (query) => {
      const status = query.state.data?.index_status;
      if (status === "pending" || status === "indexing") return 10000;
      return false;
    },
    ...options,
  });

export const useCreateChatSession = (options = {}) =>
  useMutation({
    mutationFn: chatbotApi.createSession,
    ...options,
  });

export const useAskChatbot = (options = {}) =>
  useMutation({
    mutationFn: chatbotApi.ask,
    ...options,
  });

export const useChatHistory = (sessionId, options = {}) =>
  useQuery({
    queryKey: chatbotKeys.history(sessionId),
    queryFn: async () => unwrapList(await chatbotApi.getHistory(sessionId)),
    enabled: !!sessionId,
    ...options,
  });

export const useDeleteChatSession = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatbotApi.deleteSession,
    onSuccess: (data, sessionId, context) => {
      if (sessionId) {
        queryClient.removeQueries({ queryKey: chatbotKeys.history(sessionId) });
      }
      options.onSuccess?.(data, sessionId, context);
    },
    ...options,
  });
};

export const useIndexChatbotMaterial = (options = {}) =>
  useMutation({
    mutationFn: chatbotApi.indexMaterial,
    ...options,
  });

export const useIndexChatbotSubject = (options = {}) =>
  useMutation({
    mutationFn: chatbotApi.indexSubject,
    ...options,
  });
