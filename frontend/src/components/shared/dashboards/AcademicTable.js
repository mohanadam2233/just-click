import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import AsyncDropdown from "@/components/shared/inputs/AsyncDropdown";
import { useMemo, useState, useEffect } from "react";

// ─── SVG Icons used in Frappe UI ──────────────────────────────────────────────

const FilterIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const FilterClearIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
    <line
      x1="2"
      y1="2"
      x2="22"
      y2="22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const SortDescIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
    />
  </svg>
);

const MenuDotsIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const AddCommentIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

// ─── Badge Logic ─────────────────────────────────────────────────────────────

const getStatusColor = (val) => {
  const v = String(val).toLowerCase();
  if (v.includes("active") || v.includes("open") || v.includes("published")) {
    return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20";
  }
  if (v.includes("inactive") || v.includes("draft") || v.includes("closed")) {
    return "text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700";
  }
  return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20";
};

const FrappeBadge = ({ value }) => {
  const colors = getStatusColor(value);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
};

const TypePill = ({ value }) => (
  <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium tracking-wide border border-gray-200 dark:border-gray-700">
    <span className="text-gray-400 dark:text-gray-500 mr-1">▪</span>
    {value}
  </span>
);

// ─── Main Component ─────────────────────────────────────────────────────────

/**
 * AcademicTable — Frappe ERPNext style data table.
 *
 * Configurable via props:
 *  - title: Main header
 *  - columns: Array<{ key, label, width, type }>
 *  - data: Array of objects
 *  - actions: Array<{ label, icon, onClick }> — the bulk actions (Print, Export, Delete, etc.)
 *  - sortOptions: Array<{ label, value }> - options for the "Last Updated On" style dropdown
 *  - onRowClick: Function triggered when a row is clicked (passes row object)
 */
const AcademicTable = ({
  title,
  columns = [],
  data = [],
  addNewLabel = "Add New",
  onAddNew,
  onRowClick,
  actions = [
    { label: "Delete", action: "delete" },
    { label: "Print", action: "print" },
    { label: "Export", action: "export" },
  ],
  sortOptions = [
    { label: "Last Updated On", value: "updated" },
    { label: "Created On", value: "created" },
  ],
}) => {
  // State
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Column resizing state
  const [colWidths, setColWidths] = useState({});
  const [resizingCol, setResizingCol] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!resizingCol) return;
      const newWidth = Math.max(50, startWidth + (e.clientX - startX));
      setColWidths((prev) => ({ ...prev, [resizingCol]: newWidth }));
    };
    const onMouseUp = () => {
      if (resizingCol) {
        document.body.style.cursor = "default";
        setResizingCol(null);
      }
    };
    if (resizingCol) {
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      document.body.style.cursor = "default";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizingCol, startX, startWidth]);

  const handleResizeStart = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(key);
    setStartX(e.clientX);
    const th = e.target.closest("th");
    if (th) {
      setStartWidth(th.getBoundingClientRect().width);
    } else {
      setStartWidth(100);
    }
  };

  // Derived state
  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === data.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(data.map((row, idx) => row.id || idx));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const clearFilters = () => setFilters({});

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      for (const [key, searchVal] of Object.entries(filters)) {
        if (searchVal && searchVal.trim() !== "") {
          const cellVal = String(row[key] || "").toLowerCase();
          if (!cellVal.includes(searchVal.toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    });
  }, [data, filters]);

  // Paginate Data
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    return filteredData.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredData, page, pageSize]);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-sm shadow-sm min-h-[600px] text-[13px] font-sans">
      {/* ─── Top Navbar (Frappe App Header Style) ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="flex items-center text-gray-500 hover:text-gray-900 cursor-pointer">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 ? (
            // Bulk Actions Toolbar (Replaces Right Header Controls)
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              <span className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></span>
              {actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (act.onClick) {
                      act.onClick(selectedIds);
                    } else {
                      alert(`Bulk action: ${act.label} on ${selectedIds.length} items`);
                    }
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50"
                >
                  {act.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              <button className="p-1.5 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <RefreshIcon />
              </button>

              <button className="p-1.5 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <MenuDotsIcon />
              </button>
            </>
          )}

          {onAddNew && (
            <ButtonPrimary type="button" onClick={onAddNew}>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {addNewLabel}
              </div>
            </ButtonPrimary>
          )}
        </div>
      </div>

      {/* ─── Filter Row ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 gap-y-3">
        {/* Input filters per column (showing max 4 for compactness like Frappe) */}
        <div className="flex gap-2 flex-wrap max-w-4xl items-center">
          {columns.slice(0, 4).map((col) => {
            // Render dropdown if col.filterDropdown is provided, otherwise text input
            if (col.filterDropdown) {
              // Extract hook logic provided via column mapping
              const ddProps = col.filterDropdown;
              return (
                <div key={col.key} className="w-40 relative group">
                  <AsyncDropdown
                    value={filters[col.key] || ""}
                    onChange={(val) => handleFilterChange(col.key, val)}
                    options={ddProps.options || []}
                    isLoading={ddProps.isLoading}
                    hasMore={ddProps.hasMore}
                    onLoadMore={ddProps.loadMore}
                    onSearch={(query) => {
                      if (ddProps.setSearch) ddProps.setSearch(query);
                    }}
                    placeholder={col.label}
                    inputClassName="w-full pl-3 pr-7 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700/50 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-200 transition-colors"
                    getSublabel={(opt) =>
                      opt?.meta?.code
                        ? `Code: ${opt.meta.code}`
                        : opt?.meta?.description || ""
                    }
                  />
                  {filters[col.key] && (
                    <button
                      onClick={() => handleFilterChange(col.key, "")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 hidden group-hover:flex z-10"
                      title="Clear selection"
                    >
                      <svg
                        className="w-3 h-3"
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
                </div>
              );
            }

            return (
              <input
                key={col.key}
                type="text"
                placeholder={col.label}
                value={filters[col.key] || ""}
                onChange={(e) => handleFilterChange(col.key, e.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700/50 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none w-32 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-200 transition-colors"
              />
            );
          })}
        </div>

        {/* Right side controls (Pagination Select instead of Sort) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Show per page
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 outline-none cursor-pointer transition-colors"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      {/* ─── Table Area ──────────────────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800">
              {/* Checkbox Col */}
              <th className="py-3 px-4 w-10 text-center font-normal">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                />
              </th>

              {/* Data Cols */}
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className={`py-3 px-2 text-xs font-medium text-gray-500 relative select-none ${colWidths[col.key] ? "" : (col.width || "")}`}
                  style={colWidths[col.key] ? { width: colWidths[col.key] + "px", minWidth: colWidths[col.key] + "px" } : {}}
                >
                  {col.label}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, col.key)}
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors z-10"
                    title="Drag to resize"
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 3}
                  className="py-12 text-center text-gray-500"
                >
                  No records found
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIdx) => {
                const rowId = row.id || rowIdx;
                const isSelected = selectedIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`border-b border-gray-100 dark:border-slate-800/70 group transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50 ${onRowClick ? "cursor-pointer" : ""} ${isSelected ? "bg-blue-50/50 dark:bg-blue-500/10" : ""}`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3.5 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleSelectRow(rowId, e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>

                    {/* Data Cells */}
                    {columns.map((col, idx) => {
                      const val = row[col.key];
                      return (
                        <td
                          key={col.key}
                          className={`py-3.5 px-2 ${col.width || ""}`}
                        >
                          {col.type === "badge" ? (
                            <FrappeBadge value={val} />
                          ) : col.type === "typeBadge" ? (
                            <TypePill value={val} />
                          ) : (
                            <span
                              className={`${col.bold || col.linkRow ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"} ${col.linkRow ? "hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer" : ""}`}
                            >
                              {val || "—"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Bottom Pagination ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/30">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Showing {paginatedData.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(page * pageSize, filteredData.length)} of{" "}
          {filteredData.length} entries
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicTable;
