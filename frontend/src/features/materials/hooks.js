"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { materialsApi } from "./api";
import { materialsKeys } from "./keys";

/**
 * Get single material
 */
export function useMaterialDetail(id, options = {}) {
  return useQuery({
    queryKey: materialsKeys.detail(id),
    queryFn: () => materialsApi.getMaterial(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Normal paginated list
 * Example:
 * useMaterialsList({ mode: "page", page: 1, per_page: 10, search: "python" })
 */
export function useMaterialsList(params = {}, options = {}) {
  return useQuery({
    queryKey: materialsKeys.list(params),
    queryFn: () => materialsApi.getMaterialsList(params),
    ...options,
  });
}

/**
 * Infinite / cursor list
 * Example:
 * useInfiniteMaterialsList({ mode: "cursor", limit: 10, course_id: 5 })
 */
export function useInfiniteMaterialsList(baseParams = {}, options = {}) {
  return useInfiniteQuery({
    queryKey: materialsKeys.list({
      ...baseParams,
      mode: "cursor",
      infinite: true,
    }),
    queryFn: ({ pageParam = "" }) =>
      materialsApi.getMaterialsList({
        ...baseParams,
        mode: "cursor",
        limit: 10,
        cursor: pageParam || undefined,
      }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (pagination?.has_more && pagination?.next_cursor) {
        return pagination.next_cursor;
      }
      return undefined;
    },
    ...options,
  });
}

/**
 * Materials filter options
 * Example:
 * useMaterialFilterOptions()
 * useMaterialFilterOptions({ semester_id: 4 })
 * useMaterialFilterOptions({ semester_id: 4, course_id: 16 })
 */
export function useMaterialFilterOptions(params = {}, options = {}) {
  return useQuery({
    queryKey: materialsKeys.filterOptions(params),
    queryFn: () => materialsApi.getMaterialFilterOptions(params),
    ...options,
  });
}

/**
 * Create material
 */
export function useCreateMaterial(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsApi.createMaterial,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

/**
 * Update material
 */
export function useUpdateMaterial(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsApi.updateMaterial,
    onSuccess: (data, variables, context) => {
      const id = variables?.id;

      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });

      if (id) {
        queryClient.invalidateQueries({ queryKey: materialsKeys.detail(id) });
      }

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

/**
 * Delete single material
 */
export function useDeleteMaterial(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsApi.deleteMaterial,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      queryClient.removeQueries({ queryKey: materialsKeys.detail(id) });

      if (options.onSuccess) {
        options.onSuccess(data, id, context);
      }
    },
    ...options,
  });
}

/**
 * Bulk delete materials
 */
export function useBulkDeleteMaterials(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsApi.bulkDeleteMaterials,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });

      const ids = variables?.ids || [];
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: materialsKeys.detail(id) });
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

/**
 * Normal paginated list for favorites
 */
export function useMaterialsFavoritesList(params = {}, options = {}) {
  return useQuery({
    queryKey: materialsKeys.list({ ...params, type: "favorites" }),
    queryFn: () => materialsApi.getFavoritesList(params),
    ...options,
  });
}

/**
 * Toggle favorite
 */
export function useToggleMaterialFavorite(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsApi.setFavorite,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: materialsKeys.detail(variables.id),
        });
      }

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

/**
 * Track material view
 */
export function useTrackMaterialView(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cooldown }) => materialsApi.trackView(id, cooldown),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: materialsKeys.detail(variables.id),
        });
      }

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

/**
 * Track material download
 */
export function useTrackMaterialDownload(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsApi.trackDownload,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });

      if (id) {
        queryClient.invalidateQueries({ queryKey: materialsKeys.detail(id) });
      }

      if (options.onSuccess) {
        options.onSuccess(data, id, context);
      }
    },
    ...options,
  });
}
