"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AsyncDropdown from "../inputs/AsyncDropdown";

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M6 7h12M9 7V5h6v2m-7 0v12m4-12v12m4-12v12M5 7l1 13a1 1 0 001 1h10a1 1 0 001-1l1-13"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

function createStableId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `row-${crypto.randomUUID()}`;
  }
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const defaultCreateRow = (columns = [], currentRows = []) => {
  const row = {
    __id: createStableId(),
  };

  columns.forEach((col) => {
    if (col.key === "idx") {
      row[col.key] = currentRows.length + 1;
      return;
    }

    if (col.defaultValue !== undefined) {
      row[col.key] =
        typeof col.defaultValue === "function"
          ? col.defaultValue(currentRows)
          : col.defaultValue;
      return;
    }

    if (col.type === "checkbox") {
      row[col.key] = false;
      return;
    }

    row[col.key] = "";
  });

  return row;
};

const getModalFieldSpan = (layout) => {
  if (layout === "half") return "col-span-12 md:col-span-6";
  return "col-span-12";
};

const normalizeNumberValue = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = Number(value);
  return Number.isNaN(parsed) ? "" : parsed;
};

const resolveColumnBool = (column, propName, fallback = true) => {
  if (typeof column[propName] === "function") return column[propName];
  if (typeof column[propName] === "boolean") return column[propName];
  return fallback;
};

const canEditInTable = (column, row, rowIndex) => {
  if (column.readOnly || column.key === "idx") return false;
  const rule = resolveColumnBool(column, "editableInTable", true);
  return typeof rule === "function" ? rule(row, rowIndex) : rule;
};

const canEditInModal = (column, row, rowIndex) => {
  if (column.readOnly || column.key === "idx") return false;
  const rule = resolveColumnBool(column, "editableInModal", true);
  return typeof rule === "function" ? rule(row, rowIndex) : rule;
};

const renderReadonlyCellValue = (column, value, row, rowIndex) => {
  if (column.render) return column.render(value, row, rowIndex);
  if (column.type === "checkbox") return value ? "Yes" : "No";
  return value || value === 0 ? value : "";
};

const ModalFieldInput = ({ column, value, onChange, row }) => {
  const inputClass =
    "w-full rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500";

  if (column.type === "textarea") {
    return (
      <textarea
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={column.placeholder || ""}
      />
    );
  }

  if (column.type === "checkbox") {
    return (
      <label className="inline-flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {column.checkboxLabel || column.label}
        </span>
      </label>
    );
  }

  if (column.type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="" disabled>
          Select...
        </option>
        {column.options?.map((opt) => {
          const normalized =
            typeof opt === "object"
              ? opt
              : { label: String(opt), value: String(opt) };

          return (
            <option key={normalized.value} value={normalized.value}>
              {normalized.label}
            </option>
          );
        })}
      </select>
    );
  }

  if (column.type === "async-dropdown") {
    return (
      <AsyncDropdown
        value={value}
        onChange={onChange}
        options={column.dropdownProps?.options || []}
        isLoading={column.dropdownProps?.isLoading}
        hasMore={column.dropdownProps?.hasMore}
        onLoadMore={column.dropdownProps?.loadMore}
        onSearch={(query) => column.dropdownProps?.setSearch?.(query, row)}
        placeholder={column.placeholder || "Select..."}
        inputClassName={inputClass}
        getSublabel={column.dropdownProps?.getSublabel}
      />
    );
  }

  return (
    <input
      type={column.type || "text"}
      value={value ?? ""}
      onChange={(e) =>
        onChange(
          column.type === "number"
            ? normalizeNumberValue(e.target.value)
            : e.target.value
        )
      }
      className={inputClass}
      placeholder={column.placeholder || ""}
    />
  );
};

const InlineCellInput = ({ column, value, onChange, row, rowIndex }) => {
  const baseClass =
    "w-full min-w-0 bg-transparent text-[13px] text-gray-800 dark:text-gray-200 outline-none border border-transparent rounded px-2 py-1 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800";

  if (!canEditInTable(column, row, rowIndex)) {
    return (
      <span className="block px-2 py-1 text-[13px] text-gray-800 dark:text-gray-200">
        {renderReadonlyCellValue(column, value, row, rowIndex)}
      </span>
    );
  }

  if (column.type === "checkbox") {
    return (
      <div className="px-2 py-1">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
        />
      </div>
    );
  }

  if (column.type === "textarea") {
    return (
      <textarea
        rows={1}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={column.placeholder || ""}
        className={`${baseClass} resize-y`}
      />
    );
  }

  if (column.type === "number") {
    return (
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(normalizeNumberValue(e.target.value))}
        placeholder={column.placeholder || ""}
        className={baseClass}
      />
    );
  }

  if (column.type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
      >
        <option value="" disabled>
          Select...
        </option>
        {column.options?.map((opt) => {
          const normalized =
            typeof opt === "object"
              ? opt
              : { label: String(opt), value: String(opt) };

          return (
            <option key={normalized.value} value={normalized.value}>
              {normalized.label}
            </option>
          );
        })}
      </select>
    );
  }

  if (column.type === "async-dropdown") {
    return (
      <AsyncDropdown
        value={value}
        onChange={onChange}
        options={column.dropdownProps?.options || []}
        isLoading={column.dropdownProps?.isLoading}
        hasMore={column.dropdownProps?.hasMore}
        onLoadMore={column.dropdownProps?.loadMore}
        onSearch={(query) => column.dropdownProps?.setSearch?.(query, row)}
        placeholder={column.placeholder || "Select..."}
        inputClassName={baseClass}
        getSublabel={column.dropdownProps?.getSublabel}
      />
    );
  }

  return (
    <input
      type={column.type || "text"}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={column.placeholder || ""}
      className={baseClass}
    />
  );
};

const ChildRowModal = ({
  open,
  row,
  rowIndex,
  columns,
  title,
  onClose,
  onApply,
}) => {
  const [draft, setDraft] = useState(row || {});
  const draftRef = useRef(row || {});

  useEffect(() => {
    const next = row || {};
    setDraft(next);
    draftRef.current = next;
  }, [row]);

  if (!open || !row) return null;

  const editableColumns = columns.filter((col) =>
    canEditInModal(col, row, rowIndex)
  );

  const updateDraft = (key, nextValue) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: nextValue };
      draftRef.current = next;
      return next;
    });
  };

  const handleApply = () => {
    onApply(draftRef.current);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-4"
      onClick={handleApply}
    >
      <div
        className="w-full max-w-4xl rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Editing Row #{rowIndex + 1}
            </h3>
            {title ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 grid grid-cols-12 gap-5">
          {editableColumns.length > 0 ? (
            editableColumns.map((col) => (
              <div key={col.key} className={getModalFieldSpan(col.layout)}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {col.label}
                  {col.required ? <span className="text-red-500 ml-1">*</span> : null}
                </label>

                <ModalFieldInput
                  column={col}
                  value={draft[col.key]}
                  row={draft}
                  onChange={(nextVal) => updateDraft(col.key, nextVal)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-12 text-sm text-gray-500 dark:text-gray-400">
              No editable fields found.
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-md border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const FrappeChildTable = ({
  label,
  value = [],
  onChange,
  error,
  columns = [],
  editable = true,
  addRowLabel = "Add Row",
  emptyMessage = "No rows added yet.",
  titleField,
  maxHeight = null,

  allowAddRow = true,
  allowDeleteSelected = true,
  allowRowSelection = true,
  showRowSelection = true,
  showAddRowButton = true,
  showDeleteSelectedButton = true,
  showMoreAction = true,
  useModal = true,
  autoOpenNewRowModal = false,
  showFooter = true,
}) => {
  const rows = useMemo(() => {
    return (value || []).map((row, index) => ({
      ...row,
      __id: row.__id || createStableId(),
      idx: row.idx ?? index + 1,
    }));
  }, [value]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => rows.some((row) => row.__id === id)));

    if (editingIndex !== null && !rows[editingIndex]) {
      setEditingIndex(null);
    }
  }, [rows, editingIndex]);

  const hasSelectionColumn = showRowSelection;
  const hasMoreColumn = showMoreAction && useModal;
  const addRowDisabled = !editable || !allowAddRow;
  const deleteDisabled = !editable || !allowDeleteSelected || !selectedIds.length;

  const syncRows = (nextRows) => {
    const normalized = nextRows.map((row, index) => ({
      ...row,
      __id: row.__id || createStableId(),
      idx: index + 1,
    }));
    onChange?.(normalized);
  };

  const handleAddRow = () => {
    if (addRowDisabled) return;

    const newRow = defaultCreateRow(columns, rows);
    const nextRows = [...rows, newRow];
    syncRows(nextRows);

    if (useModal && autoOpenNewRowModal) {
      setEditingIndex(nextRows.length - 1);
    }
  };

  const handleDeleteSelected = () => {
    if (deleteDisabled) return;

    const nextRows = rows.filter((row) => !selectedIds.includes(row.__id));
    setSelectedIds([]);
    syncRows(nextRows);

    if (editingIndex !== null) {
      setEditingIndex(null);
    }
  };

  const handleSelectAll = (checked) => {
    if (!allowRowSelection) return;
    setSelectedIds(checked ? rows.map((r) => r.__id) : []);
  };

  const handleRowSelect = (rowId, checked) => {
    if (!allowRowSelection) return;
    setSelectedIds((prev) =>
      checked ? [...new Set([...prev, rowId])] : prev.filter((id) => id !== rowId)
    );
  };

  const updateInlineCell = (rowIndex, key, nextValue) => {
    const nextRows = [...rows];
    nextRows[rowIndex] = {
      ...nextRows[rowIndex],
      [key]: nextValue,
    };
    syncRows(nextRows);
  };

  const applyModalDraftAt = (rowIndex, draft) => {
    if (rowIndex === null || rowIndex === undefined) return;
    const nextRows = [...rows];
    nextRows[rowIndex] = {
      ...nextRows[rowIndex],
      ...draft,
    };
    syncRows(nextRows);
  };

  const editingRow =
    editingIndex !== null && rows[editingIndex] ? rows[editingIndex] : null;

  const isAllSelected =
    allowRowSelection && rows.length > 0 && selectedIds.length === rows.length;

  const isIndeterminate =
    allowRowSelection &&
    selectedIds.length > 0 &&
    selectedIds.length < rows.length;

  const footerVisible =
    showFooter && (showAddRowButton || showDeleteSelectedButton);

  const colSpan =
    columns.length + (hasSelectionColumn ? 1 : 0) + (hasMoreColumn ? 1 : 0);

  return (
    <div className="w-full font-sans">
      {label ? (
        <div className="mb-1.5">
          <label className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
            {label}
          </label>
        </div>
      ) : null}

      <div className="w-full border border-gray-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900">
        <div
          className="w-full overflow-x-auto"
          style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
        >
          <table className="w-full min-w-[600px] text-[13px] border-collapse">
            <thead className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <tr>
                {hasSelectionColumn ? (
                  <th className="w-10 px-2 py-2 text-center border-r border-gray-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(isAllSelected)}
                      disabled={!allowRowSelection}
                      ref={(input) => {
                        if (input) input.indeterminate = Boolean(isIndeterminate);
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </th>
                ) : null}

                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-2 text-left font-normal text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-slate-700 last:border-r-0 ${col.width || ""}`}
                  >
                    {col.label}
                    {col.required ? <span className="text-red-500 ml-0.5">*</span> : null}
                  </th>
                ))}

                {hasMoreColumn ? (
                  <th className="w-20 px-3 py-2 text-center">
                    <SettingsIcon />
                  </th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <tr
                    key={row.__id}
                    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50/50 group last:border-b-0"
                  >
                    {hasSelectionColumn ? (
                      <td className="px-2 py-1.5 text-center border-r border-gray-200 dark:border-slate-700">
                        <input
                          type="checkbox"
                          checked={
                            allowRowSelection ? selectedIds.includes(row.__id) : false
                          }
                          disabled={!allowRowSelection}
                          onChange={(e) => handleRowSelect(row.__id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                    ) : null}

                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-1.5 text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-slate-700 last:border-r-0 align-middle"
                      >
                        <InlineCellInput
                          column={col}
                          value={row[col.key]}
                          row={row}
                          rowIndex={rowIndex}
                          onChange={(nextVal) =>
                            updateInlineCell(rowIndex, col.key, nextVal)
                          }
                        />
                      </td>
                    ))}

                    {hasMoreColumn ? (
                      <td className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingIndex(rowIndex)}
                          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-[13px] font-normal transition-colors"
                        >
                          <EditIcon />
                          More
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {footerVisible ? (
        <div className="flex items-center justify-between mt-3 px-0">
          <div className="flex items-center gap-2">
            {showAddRowButton ? (
              <button
                type="button"
                onClick={handleAddRow}
                disabled={addRowDisabled}
                className="px-3 py-1.5 text-[13px] bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addRowLabel}
              </button>
            ) : null}

            {showDeleteSelectedButton ? (
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={deleteDisabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] bg-red-50 dark:bg-red-900/20 text-red-600 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon />
                Delete Selected
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}

      {useModal ? (
        <ChildRowModal
          open={editingIndex !== null}
          row={editingRow}
          rowIndex={editingIndex ?? 0}
          columns={columns}
          title={titleField && editingRow ? editingRow[titleField] : ""}
          onClose={() => setEditingIndex(null)}
          onApply={(draft) => {
            if (editingIndex === null) return;
            applyModalDraftAt(editingIndex, draft);
          }}
        />
      ) : null}
    </div>
  );
};

export default FrappeChildTable;