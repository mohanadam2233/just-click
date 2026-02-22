"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchJSON } from "@/lib/http";
import { useDebounce } from "./useDebounce";

export function useDropdown({
  cacheKey, // ✅ REQUIRED in mock mode: "faculties", "departments-1", etc.
  endpoint,
  params = {},
  limit = 10,
  enabled = true,
  mockOptions,
  mockFetch,
  mapItem,
  staleTime = 60 * 1000,
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 250);

  const abortRef = useRef(null);

  const isMockArray = Array.isArray(mockOptions);
  const isMockFn = typeof mockFetch === "function";
  const isMock = isMockArray || isMockFn;

  const stableParams = useMemo(() => {
    const entries = Object.entries(params || {}).sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(entries);
  }, [params]);

  // ✅ cacheKey prevents faculty and department from sharing the same cache
  const queryKey = useMemo(() => {
    return ["dropdown", cacheKey || endpoint || "unknown", stableParams, debounced, limit];
  }, [cacheKey, endpoint, stableParams, debounced, limit]);

  const queryFn = useCallback(
    async ({ pageParam = 0 }) => {
      const offset = pageParam;

      if (isMockFn) {
        return await mockFetch(debounced, offset, limit, stableParams);
      }

      if (isMockArray) {
        let all = mockOptions || [];
        if (debounced) {
          const low = debounced.toLowerCase();
          all = all.filter((o) => String(o.label || "").toLowerCase().includes(low));
        }
        const items = all.slice(offset, offset + limit);
        const hasMore = offset + limit < all.length;
        return { items, hasMore, nextOffset: hasMore ? offset + limit : undefined };
      }

      // real API + abort
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const qs = new URLSearchParams();
      if (debounced) qs.set("search", debounced);
      qs.set("limit", String(limit));
      qs.set("offset", String(offset));
      Object.entries(stableParams).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "") return;
        qs.set(k, String(v));
      });

      const res = await fetchJSON(`${endpoint}?${qs.toString()}`, { signal: controller.signal });

      const raw = res?.data?.data || [];
      const pagination = res?.data?.pagination || { has_more: false };

      const items = mapItem
        ? raw.map(mapItem)
        : raw.map((x) => ({ label: x.label, value: x.value, meta: x.meta }));

      const hasMore = !!pagination.has_more;
      const nextOffset = hasMore ? offset + limit : undefined;

      return { items, hasMore, nextOffset };
    },
    [endpoint, stableParams, debounced, limit, isMockFn, isMockArray, mockFetch, mockOptions, mapItem]
  );

  const q = useInfiniteQuery({
    queryKey,
    queryFn,
    enabled: enabled && (isMock || !!endpoint),
    initialPageParam: 0,
    getNextPageParam: (last) => (last?.hasMore ? last.nextOffset : undefined),
    staleTime,
  });

  const options = q.data?.pages?.flatMap((p) => p.items || []) || [];

  const loadMore = useCallback(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
  }, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage]);

  return {
    options,
    isLoading: q.isLoading || q.isFetchingNextPage,
    hasMore: !!q.hasNextPage,
    search,
    setSearch,
    loadMore,
    reset: () => setSearch(""),
  };
}