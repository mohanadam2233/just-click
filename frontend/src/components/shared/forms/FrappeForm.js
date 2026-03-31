// "use client";

// import { useMemo, useState } from "react";
// import ButtonPrimary from "../buttons/ButtonPrimary";
// import TagInput from "../inputs/agInput";
// import AsyncDropdown from "../inputs/AsyncDropdown";
// import CheckboxField from "../inputs/CheckboxField";
// import FrappeChildTable from "./FrappeChildTable";

// const FrappeForm = ({
//   title = "New Document",
//   status = "Not Saved",
//   onSave,
//   isSaving = false,
//   fields = [],
//   menuOptions = [],
//   showSidebarToggle = false,
//   values = {},
//   onChange = () => {},
//   errors = {},
// }) => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const visibleFields = useMemo(() => {
//     return fields.filter((field) => {
//       if (typeof field.condition === "function") {
//         return field.condition(values);
//       }
//       return true;
//     });
//   }, [fields, values]);

//   const renderStandardField = (field) => {
//     const value = values[field.name];
//     const error = errors[field.name];

//     const inputClasses = `w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-800 border ${
//       error ? "border-red-300 dark:border-red-500/50" : "border-transparent"
//     } rounded focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:border-blue-500 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-200 transition-colors`;

//     return (
//       <div className="flex flex-col sm:flex-row mb-4 flex-1">
//         <div className="sm:w-28 lg:w-32 xl:w-36 flex-shrink-0 mb-1 sm:mb-0 sm:pr-3 flex sm:items-center sm:justify-start">
//           <label className="text-[13px] text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
//             {field.label} {field.required ? <span className="text-red-500 ml-1">*</span> : null}
//           </label>
//         </div>

//         <div className="flex-1 max-w-[460px]">
//           {(field.type === "text" || field.type === "number") && (
//             <input
//               type={field.type}
//               value={value ?? ""}
//               onChange={(e) =>
//                 onChange(
//                   field.name,
//                   field.type === "number"
//                     ? e.target.value === ""
//                       ? ""
//                       : Number(e.target.value)
//                     : e.target.value
//                 )
//               }
//               placeholder={field.placeholder || ""}
//               className={inputClasses}
//             />
//           )}

//           {field.type === "textarea" && (
//             <textarea
//               value={value ?? ""}
//               onChange={(e) => onChange(field.name, e.target.value)}
//               placeholder={field.placeholder || ""}
//               className={`${inputClasses} min-h-[100px] resize-y`}
//             />
//           )}

//           {field.type === "select" && (
//             <select
//               value={value ?? ""}
//               onChange={(e) => onChange(field.name, e.target.value)}
//               className={inputClasses}
//             >
//               <option value="" disabled>
//                 Select...
//               </option>
//               {field.options?.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//           )}

//           {field.type === "async-dropdown" && (
//             <AsyncDropdown
//               value={value}
//               onChange={(val) => onChange(field.name, val)}
//               options={field.dropdownProps?.options || []}
//               isLoading={field.dropdownProps?.isLoading}
//               hasMore={field.dropdownProps?.hasMore}
//               onLoadMore={field.dropdownProps?.loadMore}
//               onSearch={(query) => field.dropdownProps?.setSearch?.(query)}
//               placeholder={field.placeholder || "Select..."}
//               inputClassName={inputClasses}
//               getSublabel={field.dropdownProps?.getSublabel}
//             />
//           )}

//           {field.type === "tags" && (
//             <TagInput
//               value={Array.isArray(value) ? value : []}
//               onChange={(val) => onChange(field.name, val)}
//               placeholder={field.placeholder || "Type and press Enter"}
//             />
//           )}

//           {field.type === "checkbox" && (
//             <div className="flex items-start gap-2.5 pt-1">
//               <CheckboxField
//                 checked={!!value}
//                 onChange={(checked) => onChange(field.name, checked)}
//                 className="mt-0.5"
//               />
//               <div className="min-w-0">
//                 <p className="text-sm text-gray-700 dark:text-gray-300 leading-5">
//                   {field.checkboxLabel || field.label}
//                 </p>
//                 {field.checkboxDescription ? (
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-4">
//                     {field.checkboxDescription}
//                   </p>
//                 ) : null}
//               </div>
//             </div>
//           )}

//           {field.type === "file" && (
//             <div className="flex items-center gap-3">
//               <label className="flex items-center justify-center px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700">
//                 <span>Choose File</span>
//                 <input
//                   type="file"
//                   className="hidden"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (!file) return;

//                     onChange(field.name, file);

//                     if (field.sizeField) {
//                       onChange(
//                         field.sizeField,
//                         Number((file.size / (1024 * 1024)).toFixed(2))
//                       );
//                     }
//                   }}
//                 />
//               </label>

//               {value ? (
//                 <span className="text-xs text-gray-500 truncate">
//                   {value.name || String(value)}
//                 </span>
//               ) : null}
//             </div>
//           )}

//           {error ? <div className="text-xs text-red-500 mt-1">{error}</div> : null}
//         </div>
//       </div>
//     );
//   };

//   const renderChildTableField = (field) => {
//     const value = values[field.name];
//     const error = errors[field.name];

//     return (
//       <div className="w-full mb-2">
//         <FrappeChildTable
//           label={field.label}
//           value={Array.isArray(value) ? value : []}
//           onChange={(nextRows) => onChange(field.name, nextRows)}
//           error={error}
//           {...(field.childTableProps || {})}
//         />
//       </div>
//     );
//   };

//   const getColSpanClass = (field) => {
//     const layoutType = field.layout || "third";

//     if (
//       layoutType === "full" ||
//       layoutType === "stacked" ||
//       field.type === "child-table"
//     ) {
//       return "sm:col-span-12";
//     }

//     if (layoutType === "half") {
//       return "sm:col-span-6";
//     }

//     return "sm:col-span-4";
//   };

//   return (
//     <div className="flex flex-col w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-sm shadow-sm min-h-[600px] font-sans">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 relative">
//         <div className="flex items-center gap-3 mb-4 sm:mb-0">
//           <div className="flex items-center">
//             {showSidebarToggle ? (
//               <svg
//                 className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M4 6h16M4 12h16M4 18h16"
//                 />
//               </svg>
//             ) : null}

//             <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight flex items-center gap-3">
//               {title}
//               {status ? (
//                 <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
//                   <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5" />
//                   {status}
//                 </span>
//               ) : null}
//             </h1>
//           </div>
//         </div>

//         <div className="flex items-center gap-2 relative">
//           {menuOptions?.length > 0 ? (
//             <div className="relative">
//               <button
//                 type="button"
//                 onClick={() => setIsMenuOpen((prev) => !prev)}
//                 className="p-1.5 px-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
//                 title="Menu"
//               >
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
//                 </svg>
//               </button>

//               {isMenuOpen ? (
//                 <>
//                   <div
//                     className="fixed inset-0 z-10"
//                     onClick={() => setIsMenuOpen(false)}
//                   />
//                   <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded shadow-lg border border-gray-100 dark:border-slate-700 z-20 py-1">
//                     {menuOptions.map((opt, idx) => (
//                       <button
//                         key={idx}
//                         type="button"
//                         onClick={() => {
//                           setIsMenuOpen(false);
//                           opt.action?.();
//                         }}
//                         className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
//                       >
//                         {opt.label}
//                       </button>
//                     ))}
//                   </div>
//                 </>
//               ) : null}
//             </div>
//           ) : null}

//           <ButtonPrimary type="button" onClick={onSave} disabled={isSaving}>
//             {isSaving ? "Saving..." : "Save"}
//           </ButtonPrimary>
//         </div>
//       </div>

//       <div className="flex-1 p-6 md:p-8">
//         <div className="grid gap-x-6 gap-y-4 grid-cols-1 sm:grid-cols-12 w-full">
//           {visibleFields.map((field) => (
//             <div key={field.name} className={`${getColSpanClass(field)} w-full`}>
//               {field.type === "child-table"
//                 ? renderChildTableField(field)
//                 : renderStandardField(field)}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FrappeForm;
"use client";

import { useMemo, useState } from "react";
import ButtonPrimary from "../buttons/ButtonPrimary";
import TagInput from "../inputs/agInput";
import AsyncDropdown from "../inputs/AsyncDropdown";
import CheckboxField from "../inputs/CheckboxField";
import FrappeChildTable from "./FrappeChildTable";

const FrappeForm = ({
  title = "New Document",
  status = "Not Saved",
  onSave,
  isSaving = false,
  fields = [],
  menuOptions = [],
  showSidebarToggle = false,
  values = {},
  onChange = () => {},
  errors = {},
  headerActions = null,
  topContent = null,
  className = "",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const normalizedFields = useMemo(() => {
    return fields.flatMap((field) => {
      if (field?.section && Array.isArray(field?.fields)) {
        return [
          {
            __section: true,
            key: `section-${field.section}`,
            title: field.section,
          },
          ...field.fields,
        ];
      }
      return [field];
    });
  }, [fields]);

  const visibleFields = useMemo(() => {
    return normalizedFields.filter((field) => {
      if (field?.__section) return true;
      if (typeof field.condition === "function") {
        return field.condition(values);
      }
      return true;
    });
  }, [normalizedFields, values]);

  const renderStandardField = (field) => {
    const value = values[field.name];
    const error = errors[field.name];

    const inputClasses = `w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-800 border ${
      error ? "border-red-300 dark:border-red-500/50" : "border-transparent"
    } rounded focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:border-blue-500 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-200 transition-colors`;

    return (
      <div className="flex flex-col sm:flex-row mb-4 flex-1">
        <div className="sm:w-28 lg:w-32 xl:w-36 flex-shrink-0 mb-1 sm:mb-0 sm:pr-3 flex sm:items-center sm:justify-start">
          <label className="text-[13px] text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
            {field.label}{" "}
            {field.required ? (
              <span className="text-red-500 ml-1">*</span>
            ) : null}
          </label>
        </div>

        <div className="flex-1 max-w-[460px]">
          {(field.type === "text" || field.type === "number") && (
            <input
              type={field.type}
              value={value ?? ""}
              onChange={(e) =>
                onChange(
                  field.name,
                  field.type === "number"
                    ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                    : e.target.value
                )
              }
              placeholder={field.placeholder || ""}
              className={inputClasses}
            />
          )}

          {field.type === "textarea" && (
            <textarea
              value={value ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder || ""}
              className={`${inputClasses} min-h-[100px] resize-y`}
            />
          )}

          {field.type === "select" && (
            <select
              value={value ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              className={inputClasses}
            >
              <option value="" disabled>
                Select...
              </option>
              {field.options?.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {field.type === "async-dropdown" && (
            <AsyncDropdown
              value={value}
              onChange={(val) => onChange(field.name, val)}
              options={field.dropdownProps?.options || []}
              isLoading={field.dropdownProps?.isLoading}
              hasMore={field.dropdownProps?.hasMore}
              onLoadMore={field.dropdownProps?.loadMore}
              onSearch={(query) => field.dropdownProps?.setSearch?.(query)}
              placeholder={field.placeholder || "Select..."}
              inputClassName={inputClasses}
              getSublabel={field.dropdownProps?.getSublabel}
            />
          )}

          {field.type === "tags" && (
            <TagInput
              value={Array.isArray(value) ? value : []}
              onChange={(val) => onChange(field.name, val)}
              placeholder={field.placeholder || "Type and press Enter"}
            />
          )}

          {field.type === "checkbox" && (
            <div className="flex items-start gap-2.5 pt-1">
              <CheckboxField
                checked={!!value}
                onChange={(checked) => onChange(field.name, checked)}
                className="mt-0.5"
              />
              <div className="min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-5">
                  {field.checkboxLabel || field.label}
                </p>
                {field.checkboxDescription ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-4">
                    {field.checkboxDescription}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {field.type === "file" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center justify-center px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700">
                  <span>{field.fileProps?.buttonLabel || "Choose File"}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      onChange(field.name, file);

                      if (field.sizeField) {
                        onChange(
                          field.sizeField,
                          Number((file.size / (1024 * 1024)).toFixed(2))
                        );
                      }
                    }}
                  />
                </label>

                {value ? (
                  <span className="text-xs text-gray-500 truncate">
                    {value?.name || String(value)}
                  </span>
                ) : field.fileProps?.currentFileName ? (
                  <span className="text-xs text-gray-500 truncate">
                    {field.fileProps.currentFileName}
                  </span>
                ) : null}
              </div>

              {field.fileProps?.helperText ? (
                <p className="text-xs text-gray-500">{field.fileProps.helperText}</p>
              ) : null}

              {(field.fileProps?.readUrl || field.fileProps?.downloadUrl) && (
                <div className="flex flex-wrap items-center gap-2">
                  {field.fileProps?.readUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          field.fileProps.readUrl,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      className="inline-flex items-center justify-center rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      Read current file
                    </button>
                  ) : null}

                  {field.fileProps?.downloadUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          field.fileProps.downloadUrl,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      className="inline-flex items-center justify-center rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      Download current file
                    </button>
                  ) : null}

                  {field.fileProps?.metaText ? (
                    <span className="text-xs text-gray-500">
                      {field.fileProps.metaText}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {field.description ? (
            <p className="text-xs text-gray-500 mt-1">{field.description}</p>
          ) : null}

          {error ? <div className="text-xs text-red-500 mt-1">{error}</div> : null}
        </div>
      </div>
    );
  };

  const renderChildTableField = (field) => {
    const value = values[field.name];
    const error = errors[field.name];

    return (
      <div className="w-full mb-2">
        <FrappeChildTable
          label={field.label}
          value={Array.isArray(value) ? value : []}
          onChange={(nextRows) => onChange(field.name, nextRows)}
          error={error}
          {...(field.childTableProps || {})}
        />
      </div>
    );
  };

  const getColSpanClass = (field) => {
    const layoutType = field.layout || "third";

    if (
      layoutType === "full" ||
      layoutType === "stacked" ||
      field.type === "child-table"
    ) {
      return "sm:col-span-12";
    }

    if (layoutType === "half") {
      return "sm:col-span-6";
    }

    return "sm:col-span-4";
  };

  return (
    <div
      className={`flex flex-col w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-sm shadow-sm min-h-[600px] font-sans ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 relative">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="flex items-center">
            {showSidebarToggle ? (
              <svg
                className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            ) : null}

            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight flex items-center gap-3">
              {title}
              {status ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5" />
                  {status}
                </span>
              ) : null}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {headerActions}

          {menuOptions?.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-1.5 px-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                title="Menu"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {isMenuOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded shadow-lg border border-gray-100 dark:border-slate-700 z-20 py-1">
                    {menuOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          opt.action?.();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          <ButtonPrimary type="button" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </ButtonPrimary>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 space-y-6">
        {topContent ? <div>{topContent}</div> : null}

        <div className="grid gap-x-6 gap-y-4 grid-cols-1 sm:grid-cols-12 w-full">
          {visibleFields.map((field, index) => {
            if (field?.__section) {
              return (
                <div key={field.key || index} className="sm:col-span-12 pt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-800 pb-2 mb-2">
                    {field.title}
                  </div>
                </div>
              );
            }

            return (
              <div key={field.name} className={`${getColSpanClass(field)} w-full`}>
                {field.type === "child-table"
                  ? renderChildTableField(field)
                  : renderStandardField(field)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FrappeForm;