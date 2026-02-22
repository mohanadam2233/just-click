"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFloating, autoUpdate, offset, flip, shift, size } from "@floating-ui/react";

/* thin scrollbar */
const INJECT_ID = "jc-dd-scroll-css";
const SCROLL_CSS = `
[data-jc-menu]{scrollbar-width:thin;scrollbar-color:var(--jc-thumb,#cbd5e1) transparent}
[data-jc-menu]::-webkit-scrollbar{width:6px;height:6px}
[data-jc-menu]::-webkit-scrollbar-track{background:transparent}
[data-jc-menu]::-webkit-scrollbar-thumb{background-color:var(--jc-thumb,#cbd5e1);border-radius:9999px}
[data-jc-menu]::-webkit-scrollbar-thumb:hover{background-color:var(--jc-thumb-hover,#94a3b8)}
@media (prefers-color-scheme: dark){
  [data-jc-menu]{scrollbar-color:var(--jc-thumb,#475569) transparent}
  [data-jc-menu]::-webkit-scrollbar-thumb{background-color:var(--jc-thumb,#475569)}
  [data-jc-menu]::-webkit-scrollbar-thumb:hover{background-color:var(--jc-thumb-hover,#64748b)}
}`;
function ensureScrollbarCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById(INJECT_ID)) return;
  const style = document.createElement("style");
  style.id = INJECT_ID;
  style.textContent = SCROLL_CSS;
  document.head.appendChild(style);
}

const ROW_BASE =
  "px-3 py-1.5 text-[13px] leading-[18px] cursor-pointer select-none transition-colors " +
  "hover:bg-gray-100 dark:hover:bg-gray-700";

export default function AsyncDropdown({
  value,
  onChange,
  options = [],
  isLoading = false,
  hasMore = false,
  onLoadMore,

  onSearch, // drives hook search
  placeholder = "Select...",
  disabled = false,
  inputClassName = "",
  getSublabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => ensureScrollbarCSS(), []);

  const selectedOption = useMemo(
    () => options.find((o) => String(o.value) === String(value ?? "")),
    [options, value]
  );

  // when closed -> show selected label
  useEffect(() => {
    if (!isOpen) setText(selectedOption?.label ?? "");
  }, [isOpen, selectedOption?.label]);

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 10 }),
      shift({ padding: 10 }),
      size({
        padding: 10,
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(availableHeight, 280)}px`,
          });
        },
      }),
    ],
  });

  useEffect(() => {
    refs.setReference(containerRef.current);
  }, [refs]);

  // click outside closes
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => {
      const t = e.target;
      const insideInput = containerRef.current?.contains(t);
      const insideMenu = menuRef.current?.contains(t);
      if (!insideInput && !insideMenu) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  // open without clearing text (Frappe feel)
  const openMenu = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);

    // show all options initially (don’t filter by the selected label)
    onSearch?.("");

    setTimeout(() => {
      inputRef.current?.focus?.();
      // select all so user can type to replace like Frappe
      inputRef.current?.select?.();
    }, 0);
  }, [disabled, onSearch]);

  const handleSelect = useCallback(
    (opt) => {
      onChange?.(opt.value, opt);
      setIsOpen(false);
      setText(opt.label ?? "");
      onSearch?.(""); // reset query
    },
    [onChange, onSearch]
  );

  // scrolling load more
  const handleScroll = useCallback(() => {
    if (!listRef.current || !onLoadMore || !hasMore || isLoading) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) onLoadMore();
  }, [onLoadMore, hasMore, isLoading]);

  const maxIndex = Math.max(0, options.length - 1);

  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) return openMenu();
          setHighlightedIndex((p) => Math.min(p + 1, maxIndex));
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) return;
          setHighlightedIndex((p) => Math.max(p - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (!isOpen) return openMenu();
          if (options[highlightedIndex]) handleSelect(options[highlightedIndex]);
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [disabled, isOpen, openMenu, highlightedIndex, maxIndex, options, handleSelect]
  );

  return (
    <div ref={containerRef}>
      <input
        ref={inputRef}
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onFocus={() => !isOpen && openMenu()}
        onClick={() => !isOpen && openMenu()}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          if (!isOpen) setIsOpen(true);
          onSearch?.(v); // type to filter
        }}
      />

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={(node) => {
              menuRef.current = node;
              refs.setFloating(node);
            }}
            style={{ ...floatingStyles, position: "fixed", zIndex: 9999 }}
            className="pointer-events-auto"
          >
            <div className="w-full rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <div
                ref={listRef}
                onScroll={handleScroll}
                data-jc-menu
                className="overflow-y-auto overscroll-contain"
                style={{
                  maxHeight: floatingStyles?.maxHeight
                    ? Number(String(floatingStyles.maxHeight).replace("px", ""))
                    : 280,
                }}
                role="listbox"
              >
                {options.length === 0 && !isLoading && (
                  <div className="px-3 py-2 text-[13px] text-gray-500 text-center">
                    No options
                  </div>
                )}

                {options.map((opt, idx) => {
                  const selected = String(opt.value) === String(value ?? "");
                  const active = idx === highlightedIndex;
                  const sub = getSublabel ? getSublabel(opt) : opt?.meta?.description;

                  return (
                    <div
                      key={String(opt.value)}
                      role="option"
                      aria-selected={selected}
                      className={
                        ROW_BASE +
                        (active ? " bg-gray-100 dark:bg-gray-700" : "") +
                        (selected ? " bg-primaryColor/10 text-primaryColor" : "")
                      }
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(opt)}
                    >
                      <div className="flex items-center justify-between gap-3 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{opt.label}</div>
                          {sub ? (
                            <div className="truncate text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {sub}
                            </div>
                          ) : null}
                        </div>
                        {selected ? <span className="text-[12px]">✓</span> : null}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="px-3 py-2 text-[13px] text-center text-gray-500">
                    Loading…
                  </div>
                )}

                {hasMore && !isLoading && (
                  <div className="px-3 py-2 text-[12px] text-center text-gray-500">
                    Scroll to load more…
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}