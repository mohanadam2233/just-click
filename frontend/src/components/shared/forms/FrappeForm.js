// "use client";

// import { useState } from "react";
// import ButtonPrimary from "../buttons/ButtonPrimary";
// import TagInput from "../inputs/agInput";
// import AsyncDropdown from "../inputs/AsyncDropdown";
// import CheckboxField from "../inputs/CheckboxField";
// import FrappeChildTable from "./FrappeChildTable";

// /**
//  * Reusable Frappe-style Form Component
//  * @param {string} title - The title of the form document (e.g., "New Material")
//  * @param {Array} fields - Array of field objects with a `layout` property
//  * @param {Array} menuOptions - Array of actions for the "..." menu
//  * @param {boolean} showSidebarToggle - Whether to show the top-left burger menu
//  * @param {Object} values - Current form values
//  * @param {Function} onChange - Update field value (key, value)
//  * @param {Object} errors - Validation errors map { field_key: "Error message" }
//  */
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

//   const renderField = (field) => {
//     if (field.condition && !field.condition(values)) {
//       return null;
//     }

//     const value = values[field.name];
//     const error = errors[field.name];

//     const inputClasses = `w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-800 border ${
//       error ? "border-red-300 dark:border-red-500/50" : "border-transparent"
//     } rounded focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:border-blue-500 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-200 transition-colors`;

//     return (
//       <div key={field.name} className="flex flex-col sm:flex-row mb-4 flex-1">
//         {/* Label */}
//         <div className="sm:w-28 lg:w-32 xl:w-36 flex-shrink-0 mb-1 sm:mb-0 sm:pr-3 flex sm:items-center sm:justify-start">
//           <label className="text-[13px] text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
//             {field.label}{" "}
//             {field.required && <span className="text-red-500 ml-1">*</span>}
//           </label>
//         </div>

//         {/* Input */}
//         <div className="flex-1 max-w-[460px]">
//           {field.type === "text" || field.type === "number" ? (
//             <input
//               type={field.type}
//               value={value || ""}
//               onChange={(e) =>
//                 onChange(
//                   field.name,
//                   field.type === "number"
//                     ? e.target.value === ""
//                       ? ""
//                       : Number(e.target.value)
//                     : e.target.value,
//                 )
//               }
//               placeholder={field.placeholder || ""}
//               className={inputClasses}
//             />
//           ) : field.type === "textarea" ? (
//             <textarea
//               value={value || ""}
//               onChange={(e) => onChange(field.name, e.target.value)}
//               placeholder={field.placeholder || ""}
//               className={`${inputClasses} min-h-[100px] resize-y`}
//             />
//           ) : field.type === "select" ? (
//             <select
//               value={value || ""}
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
//           ) : field.type === "async-dropdown" ? (
//             <AsyncDropdown
//               value={value}
//               onChange={(val) => onChange(field.name, val)}
//               options={field.dropdownProps?.options || []}
//               isLoading={field.dropdownProps?.isLoading}
//               hasMore={field.dropdownProps?.hasMore}
//               onLoadMore={field.dropdownProps?.loadMore}
//               onSearch={(query) => {
//                 if (field.dropdownProps?.setSearch) {
//                   field.dropdownProps.setSearch(query);
//                 }
//               }}
//               placeholder={field.placeholder || "Select..."}
//               inputClassName={inputClasses}
//               getSublabel={field.dropdownProps?.getSublabel}
//             />
//           ) : field.type === "tags" ? (
//             <TagInput
//               value={Array.isArray(value) ? value : []}
//               onChange={(val) => onChange(field.name, val)}
//               placeholder={field.placeholder || "Type and press Enter"}
//             />
//           ) : field.type === "checkbox" ? (
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
//           ) : field.type === "file" ? (
//             <div className="flex items-center gap-3">
//               <label className="flex items-center justify-center px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700">
//                 <span>Choose File</span>
//                 <input
//                   type="file"
//                   className="hidden"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (file) {
//                       onChange(field.name, file);
//                       if (field.sizeField) {
//                         onChange(
//                           field.sizeField,
//                           Number((file.size / (1024 * 1024)).toFixed(2)),
//                         );
//                       }
//                     }
//                   }}
//                 />
//               </label>
//               {value && (
//                 <span className="text-xs text-gray-500 truncate">
//                   {value.name || value}
//                 </span>
//               )}
//             </div>
//           ) : field.type === "child-table" ? (
//             <FrappeChildTable
//               label={field.label}
//               value={Array.isArray(value) ? value : []}
//               onChange={(nextRows) => onChange(field.name, nextRows)}
//               error={error}
//               {...(field.childTableProps || {})}
//             />
//           ) : null}

//           {/* Validation Error */}
//           {error && field.type !== "child-table" && (
//             <div className="text-xs text-red-500 mt-1">{error}</div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-sm shadow-sm min-h-[600px] font-sans">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 relative">
//         <div className="flex items-center gap-3 mb-4 sm:mb-0">
//           <div className="flex items-center">
//             {showSidebarToggle && (
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
//             )}

//             <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight flex items-center gap-3">
//               {title}
//               {status && (
//                 <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
//                   <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
//                   {status}
//                 </span>
//               )}
//             </h1>
//           </div>
//         </div>

//         <div className="flex items-center gap-2 relative">
//           {menuOptions && menuOptions.length > 0 && (
//             <div className="relative">
//               <button
//                 type="button"
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className="p-1.5 px-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
//                 title="Menu"
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
//                 </svg>
//               </button>

//               {isMenuOpen && (
//                 <>
//                   <div
//                     className="fixed inset-0 z-10"
//                     onClick={() => setIsMenuOpen(false)}
//                   />
//                   <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded shadow-lg border border-gray-100 dark:border-slate-700 z-20 py-1">
//                     {menuOptions.map((opt, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() => {
//                           opt.action();
//                           setIsMenuOpen(false);
//                         }}
//                         className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
//                       >
//                         {opt.label}
//                       </button>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           )}

//           <ButtonPrimary type="button" onClick={onSave} disabled={isSaving}>
//             {isSaving ? "Saving..." : "Save"}
//           </ButtonPrimary>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="flex-1 p-6 md:p-8">
//         <div className="grid gap-x-6 gap-y-4 grid-cols-1 sm:grid-cols-12 w-full">
//           {fields.map((field) => {
//             const layoutType = field.layout || "third";
//             let colSpanClass = "sm:col-span-4";

//             if (
//               layoutType === "full" ||
//               layoutType === "stacked" ||
//               field.type === "child-table"
//             ) {
//               colSpanClass = "sm:col-span-12";
//             } else if (layoutType === "half") {
//               colSpanClass = "sm:col-span-6";
//             }

//             const shouldHide =
//               typeof field.condition === "function"
//                 ? !field.condition(values)
//                 : false;

//             if (shouldHide) {
//               return (
//                 <div
//                   key={field.name}
//                   className={`${colSpanClass} hidden sm:block pointer-events-none opacity-0`}
//                 />
//               );
//             }

//             return (
//               <div key={field.name} className={`${colSpanClass} w-full`}>
//                 {renderField(field)}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FrappeForm;
"use client";

import { useState } from "react";
import ButtonPrimary from "../buttons/ButtonPrimary";
import TagInput from "../inputs/agInput";
import AsyncDropdown from "../inputs/AsyncDropdown";
import CheckboxField from "../inputs/CheckboxField";
import FrappeChildTable from "./FrappeChildTable";

/**
 * Reusable Frappe-style Form Component
 */
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
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderStandardField = (field) => {
    const value = values[field.name];
    const error = errors[field.name];

    const inputClasses = `w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-800 border ${
      error ? "border-red-300 dark:border-red-500/50" : "border-transparent"
    } rounded focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:border-blue-500 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-200 transition-colors`;

    return (
      <div key={field.name} className="flex flex-col sm:flex-row mb-4 flex-1">
        <div className="sm:w-28 lg:w-32 xl:w-36 flex-shrink-0 mb-1 sm:mb-0 sm:pr-3 flex sm:items-center sm:justify-start">
          <label className="text-[13px] text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
            {field.label}{" "}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>

        <div className="flex-1 max-w-[460px]">
          {field.type === "text" || field.type === "number" ? (
            <input
              type={field.type}
              value={value || ""}
              onChange={(e) =>
                onChange(
                  field.name,
                  field.type === "number"
                    ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                    : e.target.value,
                )
              }
              placeholder={field.placeholder || ""}
              className={inputClasses}
            />
          ) : field.type === "textarea" ? (
            <textarea
              value={value || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder || ""}
              className={`${inputClasses} min-h-[100px] resize-y`}
            />
          ) : field.type === "select" ? (
            <select
              value={value || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              className={inputClasses}
            >
              <option value="" disabled>
                Select...
              </option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === "async-dropdown" ? (
            <AsyncDropdown
              value={value}
              onChange={(val) => onChange(field.name, val)}
              options={field.dropdownProps?.options || []}
              isLoading={field.dropdownProps?.isLoading}
              hasMore={field.dropdownProps?.hasMore}
              onLoadMore={field.dropdownProps?.loadMore}
              onSearch={(query) => {
                if (field.dropdownProps?.setSearch) {
                  field.dropdownProps.setSearch(query);
                }
              }}
              placeholder={field.placeholder || "Select..."}
              inputClassName={inputClasses}
              getSublabel={field.dropdownProps?.getSublabel}
            />
          ) : field.type === "tags" ? (
            <TagInput
              value={Array.isArray(value) ? value : []}
              onChange={(val) => onChange(field.name, val)}
              placeholder={field.placeholder || "Type and press Enter"}
            />
          ) : field.type === "checkbox" ? (
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
          ) : field.type === "file" ? (
            <div className="flex items-center gap-3">
              <label className="flex items-center justify-center px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700">
                <span>Choose File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(field.name, file);
                      if (field.sizeField) {
                        onChange(
                          field.sizeField,
                          Number((file.size / (1024 * 1024)).toFixed(2)),
                        );
                      }
                    }
                  }}
                />
              </label>
              {value && (
                <span className="text-xs text-gray-500 truncate">
                  {value.name || value}
                </span>
              )}
            </div>
          ) : null}

          {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
        </div>
      </div>
    );
  };

  const renderChildTableField = (field) => {
    const value = values[field.name];
    const error = errors[field.name];

    return (
      <div key={field.name} className="w-full mb-2">
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

  const renderField = (field) => {
    if (field.condition && !field.condition(values)) {
      return null;
    }

    if (field.type === "child-table") {
      return renderChildTableField(field);
    }

    return renderStandardField(field);
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-sm shadow-sm min-h-[600px] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 relative">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="flex items-center">
            {showSidebarToggle && (
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
            )}

            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight flex items-center gap-3">
              {title}
              {status && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
                  {status}
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {menuOptions && menuOptions.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 px-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                title="Menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded shadow-lg border border-gray-100 dark:border-slate-700 z-20 py-1">
                    {menuOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          opt.action();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <ButtonPrimary type="button" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </ButtonPrimary>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 md:p-8">
        <div className="grid gap-x-6 gap-y-4 grid-cols-1 sm:grid-cols-12 w-full">
          {fields.map((field) => {
            const layoutType = field.layout || "third";
            let colSpanClass = "sm:col-span-4";

            if (
              layoutType === "full" ||
              layoutType === "stacked" ||
              field.type === "child-table"
            ) {
              colSpanClass = "sm:col-span-12";
            } else if (layoutType === "half") {
              colSpanClass = "sm:col-span-6";
            }

            const shouldHide =
              typeof field.condition === "function"
                ? !field.condition(values)
                : false;

            if (shouldHide) {
              return (
                <div
                  key={field.name}
                  className={`${colSpanClass} hidden sm:block pointer-events-none opacity-0`}
                />
              );
            }

            return (
              <div key={field.name} className={`${colSpanClass} w-full`}>
                {renderField(field)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FrappeForm;
