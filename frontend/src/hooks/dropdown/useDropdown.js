// "use client";

// import { useCallback, useMemo, useRef, useState } from "react";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { fetchJSON } from "@/lib/http";
// import { useDebounce } from "./useDebounce";

// export function useDropdown({
//   cacheKey, // ✅ REQUIRED in mock mode: "faculties", "departments-1", etc.
//   endpoint,
//   params = {},
//   limit = 10,
//   enabled = true,
//   mockOptions,
//   mockFetch,
//   mapItem,
//   staleTime = 60 * 1000,
// }) {
//   const [search, setSearch] = useState("");
//   const debounced = useDebounce(search, 250);

//   const abortRef = useRef(null);

//   const isMockArray = Array.isArray(mockOptions);
//   const isMockFn = typeof mockFetch === "function";
//   const isMock = isMockArray || isMockFn;

//   const stableParams = useMemo(() => {
//     const entries = Object.entries(params || {}).sort(([a], [b]) => a.localeCompare(b));
//     return Object.fromEntries(entries);
//   }, [params]);

//   // ✅ cacheKey prevents faculty and department from sharing the same cache
//   const queryKey = useMemo(() => {
//     return ["dropdown", cacheKey || endpoint || "unknown", stableParams, debounced, limit];
//   }, [cacheKey, endpoint, stableParams, debounced, limit]);

//   const queryFn = useCallback(
//     async ({ pageParam = 0 }) => {
//       const offset = pageParam;

//       if (isMockFn) {
//         return await mockFetch(debounced, offset, limit, stableParams);
//       }

//       if (isMockArray) {
//         let all = mockOptions || [];
//         if (debounced) {
//           const low = debounced.toLowerCase();
//           all = all.filter((o) => String(o.label || "").toLowerCase().includes(low));
//         }
//         const items = all.slice(offset, offset + limit);
//         const hasMore = offset + limit < all.length;
//         return { items, hasMore, nextOffset: hasMore ? offset + limit : undefined };
//       }

//       // real API + abort
//       if (abortRef.current) abortRef.current.abort();
//       const controller = new AbortController();
//       abortRef.current = controller;

//       const qs = new URLSearchParams();
//       if (debounced) qs.set("search", debounced);
//       qs.set("limit", String(limit));
//       qs.set("offset", String(offset));
//       Object.entries(stableParams).forEach(([k, v]) => {
//         if (v === null || v === undefined || v === "") return;
//         qs.set(k, String(v));
//       });

//       const res = await fetchJSON(`${endpoint}?${qs.toString()}`, { signal: controller.signal });

//       const raw = res?.data?.data || [];
//       const pagination = res?.data?.pagination || { has_more: false };

//       const items = mapItem
//         ? raw.map(mapItem)
//         : raw.map((x) => ({ label: x.label, value: x.value, meta: x.meta }));

//       const hasMore = !!pagination.has_more;
//       const nextOffset = hasMore ? offset + limit : undefined;

//       return { items, hasMore, nextOffset };
//     },
//     [endpoint, stableParams, debounced, limit, isMockFn, isMockArray, mockFetch, mockOptions, mapItem]
//   );

//   const q = useInfiniteQuery({
//     queryKey,
//     queryFn,
//     enabled: enabled && (isMock || !!endpoint),
//     initialPageParam: 0,
//     getNextPageParam: (last) => (last?.hasMore ? last.nextOffset : undefined),
//     staleTime,
//   });

//   const options = q.data?.pages?.flatMap((p) => p.items || []) || [];

//   const loadMore = useCallback(() => {
//     if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
//   }, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage]);

//   return {
//     options,
//     isLoading: q.isLoading || q.isFetchingNextPage,
//     hasMore: !!q.hasNextPage,
//     search,
//     setSearch,
//     loadMore,
//     reset: () => setSearch(""),
//   };
// }
"use client";

import { fetchJSON } from "@/lib/http";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeItem(item) {
  if (item == null) {
    return {
      label: "",
      value: "",
      meta: {},
    };
  }

  if (!isPlainObject(item)) {
    const str = String(item);
    return {
      label: str,
      value: str,
      meta: {},
    };
  }

  const value =
    item.value ??
    item.id ??
    item.code ??
    item.slug ??
    item.key ??
    item.label ??
    item.name ??
    "";

  const label =
    item.label ??
    item.name ??
    item.title ??
    item.display_name ??
    item.code ??
    String(value ?? "");

  return {
    ...item,
    value,
    label,
    meta: isPlainObject(item.meta) ? item.meta : {},
  };
}

function extractPayload(response) {
  // Supports:
  // 1) { data: { data: [...], pagination: {...} } }
  // 2) { data: [...] }
  // 3) { items: [...], pagination: {...} }
  // 4) [...] مباشرة
  const top = response;

  if (Array.isArray(top)) {
    return {
      items: top,
      pagination: {},
    };
  }

  if (!isPlainObject(top)) {
    return {
      items: [],
      pagination: {},
    };
  }

  const d = top.data;

  if (Array.isArray(d)) {
    return {
      items: d,
      pagination: top.pagination || {},
    };
  }

  if (isPlainObject(d)) {
    if (Array.isArray(d.data)) {
      return {
        items: d.data,
        pagination: d.pagination || d.meta?.pagination || {},
      };
    }

    if (Array.isArray(d.items)) {
      return {
        items: d.items,
        pagination: d.pagination || d.meta?.pagination || {},
      };
    }
  }

  if (Array.isArray(top.items)) {
    return {
      items: top.items,
      pagination: top.pagination || {},
    };
  }

  return {
    items: [],
    pagination: {},
  };
}

function getHasMore(pagination, fallbackLength, limit) {
  if (!isPlainObject(pagination)) {
    return fallbackLength >= limit;
  }

  if (typeof pagination.has_more === "boolean") {
    return pagination.has_more;
  }

  if (typeof pagination.hasMore === "boolean") {
    return pagination.hasMore;
  }

  if (pagination.next_cursor != null && pagination.next_cursor !== "") {
    return true;
  }

  if (pagination.nextCursor != null && pagination.nextCursor !== "") {
    return true;
  }

  if (
    typeof pagination.total === "number" &&
    typeof pagination.offset === "number"
  ) {
    return pagination.offset + fallbackLength < pagination.total;
  }

  if (
    typeof pagination.total_count === "number" &&
    typeof pagination.limit === "number"
  ) {
    const currentOffset =
      typeof pagination.offset === "number" ? pagination.offset : 0;
    return currentOffset + pagination.limit < pagination.total_count;
  }

  return fallbackLength >= limit;
}

function getNextPageParam(lastPage, limit) {
  const pagination = lastPage?.pagination || {};

  if (pagination.next_cursor != null && pagination.next_cursor !== "") {
    return pagination.next_cursor;
  }

  if (pagination.nextCursor != null && pagination.nextCursor !== "") {
    return pagination.nextCursor;
  }

  if (lastPage?.hasMore) {
    return typeof lastPage?.nextOffset === "number"
      ? lastPage.nextOffset
      : typeof lastPage?.nextPage === "number"
        ? lastPage.nextPage
        : undefined;
  }

  return undefined;
}

export function useDropdown({
  cacheKey,
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
    const entries = Object.entries(params || {})
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));

    return Object.fromEntries(entries);
  }, [params]);

  const queryKey = useMemo(() => {
    return [
      "dropdown",
      cacheKey || endpoint || "unknown",
      stableParams,
      debounced,
      limit,
    ];
  }, [cacheKey, endpoint, stableParams, debounced, limit]);

  const queryFn = useCallback(
    async ({ pageParam = 0 }) => {
      if (isMockFn) {
        const res = await mockFetch(debounced, pageParam, limit, stableParams);
        const items = Array.isArray(res?.items) ? res.items : [];
        const normalized = (
          mapItem ? items.map(mapItem) : items.map(normalizeItem)
        ).filter(Boolean);

        return {
          items: normalized,
          pagination: res?.pagination || {},
          hasMore: !!res?.hasMore,
          nextOffset:
            typeof res?.nextOffset === "number" ? res.nextOffset : undefined,
          nextPage:
            typeof res?.nextPage === "number" ? res.nextPage : undefined,
        };
      }

      if (isMockArray) {
        let all = Array.isArray(mockOptions) ? mockOptions : [];

        if (debounced) {
          const low = debounced.toLowerCase();
          all = all.filter((o) =>
            String(o?.label ?? o?.name ?? o?.title ?? "")
              .toLowerCase()
              .includes(low),
          );
        }

        const items = all.slice(pageParam, pageParam + limit);
        const hasMore = pageParam + limit < all.length;
        const normalized = (
          mapItem ? items.map(mapItem) : items.map(normalizeItem)
        ).filter(Boolean);

        return {
          items: normalized,
          pagination: {
            offset: pageParam,
            limit,
            total: all.length,
            has_more: hasMore,
          },
          hasMore,
          nextOffset: hasMore ? pageParam + limit : undefined,
        };
      }

      if (!endpoint) {
        return {
          items: [],
          pagination: {},
          hasMore: false,
        };
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const qs = new URLSearchParams();

      if (debounced) {
        qs.set("search", debounced);
      }

      // support both offset/cursor based loading
      if (typeof pageParam === "number") {
        qs.set("offset", String(pageParam));
      } else if (typeof pageParam === "string" && pageParam) {
        qs.set("cursor", pageParam);
      }

      qs.set("limit", String(limit));

      Object.entries(stableParams).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "") return;
        qs.set(k, String(v));
      });

      let res;
      try {
        res = await fetchJSON(`${endpoint}?${qs.toString()}`, {
          signal: controller.signal,
        });
      } catch (error) {
        if (error?.name === "AbortError") {
          return {
            items: [],
            pagination: {},
            hasMore: false,
            aborted: true,
          };
        }
        throw error;
      }

      const { items: rawItems, pagination } = extractPayload(res);

      const mapped = mapItem
        ? rawItems.map(mapItem)
        : rawItems.map(normalizeItem);

      const cleanItems = mapped.filter(Boolean);

      const hasMore = getHasMore(pagination, cleanItems.length, limit);

      let nextOffset;
      if (typeof pageParam === "number" && hasMore) {
        nextOffset = pageParam + limit;
      }

      return {
        items: cleanItems,
        pagination,
        hasMore,
        nextOffset,
      };
    },
    [
      endpoint,
      stableParams,
      debounced,
      limit,
      isMockFn,
      isMockArray,
      mockFetch,
      mockOptions,
      mapItem,
    ],
  );

  const q = useInfiniteQuery({
    queryKey,
    queryFn,
    enabled: enabled && (isMock || !!endpoint),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage, limit),
    staleTime,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const options = useMemo(() => {
    const all = q.data?.pages?.flatMap((p) => p?.items || []) || [];
    const seen = new Set();

    return all.filter((item, index) => {
      const key = `${String(item?.value ?? "")}__${String(item?.label ?? "")}__${index}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [q.data]);

  const loadMore = useCallback(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) {
      q.fetchNextPage();
    }
  }, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage]);

  const reset = useCallback(() => {
    setSearch("");
  }, []);

  const refetch = useCallback(() => {
    return q.refetch();
  }, [q]);

  return {
    options,
    isLoading: q.isLoading || q.isFetching || q.isFetchingNextPage,
    isInitialLoading: q.isLoading,
    isFetchingNextPage: q.isFetchingNextPage,
    isError: q.isError,
    error: q.error,
    hasMore: !!q.hasNextPage,
    search,
    setSearch,
    loadMore,
    reset,
    refetch,
  };
}
