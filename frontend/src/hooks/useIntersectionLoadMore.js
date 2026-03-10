"use client";

import { useEffect, useRef } from "react";

export default function useIntersectionLoadMore({
  enabled,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  rootMargin = "300px",
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore?.();
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled, hasNextPage, isFetchingNextPage, onLoadMore, rootMargin]);

  return ref;
}
