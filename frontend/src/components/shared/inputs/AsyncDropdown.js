"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
}
`;

function ensureScrollbarCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById(INJECT_ID)) return;

  const style = document.createElement("style");
  style.id = INJECT_ID;
  style.textContent = SCROLL_CSS;
  document.head.appendChild(style);
}

function normalizeOption(opt, index) {
  if (opt == null) {
    return {
      key: `opt-null-${index}`,
      value: "",
      label: "",
      meta: {},
      raw: opt,
    };
  }

  if (typeof opt !== "object") {
    const str = String(opt);
    return {
      key: `opt-primitive-${str}-${index}`,
      value: str,
      label: str,
      meta: {},
      raw: opt,
    };
  }

  const rawValue =
    opt.value ?? opt.id ?? opt.code ?? opt.slug ?? opt.label ?? index;

  const rawLabel =
    opt.label ??
    opt.name ??
    opt.title ??
    opt.display_name ??
    opt.code ??
    rawValue;

  const value = rawValue == null ? "" : String(rawValue);
  const label = rawLabel == null ? "" : String(rawLabel);

  const keyBase =
    opt.value ??
    opt.id ??
    opt.code ??
    opt.slug ??
    opt.label ??
    opt.name ??
    opt.title ??
    index;

  return {
    ...opt,
    value,
    label,
    key: `opt-${String(keyBase)}-${index}`,
    meta: opt.meta || {},
    raw: opt,
  };
}

const ROW_BASE =
  "px-3 py-1.5 text-[13px] leading-[18px] cursor-pointer select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700";

export default function AsyncDropdown({
  value,
  onChange,
  options = [],
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onSearch,
  placeholder = "Select...",
  disabled = false,
  inputClassName = "",
  getSublabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState(null);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    ensureScrollbarCSS();
  }, []);

  const normalizedOptions = useMemo(() => {
    const arr = Array.isArray(options) ? options : [];
    return arr.map((opt, index) => normalizeOption(opt, index));
  }, [options]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find(
      (opt) => String(opt.value) === String(value ?? ""),
    );
  }, [normalizedOptions, value]);

  useEffect(() => {
    if (!isOpen) {
      setText(selectedOption?.label ?? "");
    }
  }, [isOpen, selectedOption]);

  const updateMenuPosition = useCallback(() => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();

    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleWindowChange = () => updateMenuPosition();

    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const onDown = (e) => {
      const target = e.target;
      const insideInput = wrapperRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);

      if (!insideInput && !insideMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus?.();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setHighlightedIndex((prev) =>
      Math.min(prev, Math.max(0, normalizedOptions.length - 1)),
    );
  }, [isOpen, normalizedOptions.length]);

  // const openMenu = useCallback(() => {
  //   if (disabled) return;
  //   setIsOpen(true);
  //   setHighlightedIndex(0);
  //   updateMenuPosition();
  //   onSearch?.("");
  // }, [disabled, onSearch, updateMenuPosition]);
  const openMenu = useCallback(() => {
    if (disabled) return;

    setIsOpen(true);
    setHighlightedIndex(0);
    updateMenuPosition();

    onSearch?.(""); // reset search
    onLoadMore?.(); // 👈 force fetch
  }, [disabled, onSearch, updateMenuPosition, onLoadMore]);
  const handleSelect = useCallback(
    (opt) => {
      onChange?.(opt.value, opt.raw ?? opt);
      setText(opt.label ?? "");
      setIsOpen(false);
      onSearch?.("");
    },
    [onChange, onSearch],
  );

  const clearSelection = useCallback(() => {
    setText("");
    setIsOpen(false);
    onChange?.("", null);
    onSearch?.("");
  }, [onChange, onSearch]);

  const handleScroll = useCallback(() => {
    if (!listRef.current || !onLoadMore || !hasMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, isLoading]);

  const maxIndex = Math.max(0, normalizedOptions.length - 1);

  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            openMenu();
            return;
          }
          setHighlightedIndex((prev) => Math.min(prev + 1, maxIndex));
          break;

        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) return;
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case "Enter":
          e.preventDefault();
          if (!isOpen) {
            openMenu();
            return;
          }
          if (normalizedOptions[highlightedIndex]) {
            handleSelect(normalizedOptions[highlightedIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;

        case "Backspace":
          if (!text && value) {
            e.preventDefault();
            clearSelection();
          }
          break;

        default:
          break;
      }
    },
    [
      disabled,
      isOpen,
      openMenu,
      maxIndex,
      normalizedOptions,
      highlightedIndex,
      handleSelect,
      text,
      value,
      clearSelection,
    ],
  );

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
        aria-haspopup="listbox"
        aria-controls={isOpen ? "async-dropdown-listbox" : undefined}
        aria-autocomplete="list"
        onFocus={() => {
          if (!isOpen) openMenu();
        }}
        onClick={() => {
          if (!isOpen) openMenu();
        }}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          const nextValue = e.target.value;
          setText(nextValue);

          if (!isOpen) {
            setIsOpen(true);
            updateMenuPosition();
          }

          if (nextValue === "") {
            onChange?.("", null);
          }

          onSearch?.(nextValue);
        }}
      />

      {!!value && !disabled && (
        <button
          type="button"
          onClick={clearSelection}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
          title="Clear selection"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {isOpen &&
        typeof document !== "undefined" &&
        menuStyle &&
        createPortal(
          <div ref={menuRef} style={menuStyle} className="pointer-events-auto">
            <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <div
                ref={listRef}
                onScroll={handleScroll}
                data-jc-menu
                className="overflow-y-auto overscroll-contain max-h-[280px]"
                role="listbox"
                id="async-dropdown-listbox"
              >
                {normalizedOptions.length === 0 && !isLoading && (
                  <div className="px-3 py-2 text-[13px] text-gray-500 text-center">
                    No options
                  </div>
                )}

                {normalizedOptions.map((opt, idx) => {
                  const selected = String(opt.value) === String(value ?? "");
                  const active = idx === highlightedIndex;
                  const sub = getSublabel
                    ? getSublabel(opt)
                    : opt?.meta?.description;

                  return (
                    <div
                      key={opt.key}
                      role="option"
                      aria-selected={selected}
                      className={
                        ROW_BASE +
                        (active ? " bg-gray-100 dark:bg-gray-700" : "") +
                        (selected
                          ? " bg-primaryColor/10 text-primaryColor"
                          : "")
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
                        {selected ? (
                          <span className="text-[12px]">✓</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="px-3 py-2 text-[13px] text-center text-gray-500">
                    Loading...
                  </div>
                )}

                {hasMore && !isLoading && (
                  <div className="px-3 py-2 text-[12px] text-center text-gray-500">
                    Scroll to load more...
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
