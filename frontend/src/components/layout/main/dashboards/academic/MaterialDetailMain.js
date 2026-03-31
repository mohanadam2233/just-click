
// // "use client";

// // import FrappeForm from "@/components/shared/forms/FrappeForm";
// // import {
// //   useChaptersDropdown,
// //   useCoursesDropdown,
// // } from "@/features/academic/hooks";
// // import {
// //   useDeleteMaterial,
// //   useMaterialDetail,
// //   useUpdateMaterial,
// // } from "@/features/materials/hooks";
// // import useNotify from "@/hooks/useNotify";
// // import { useRouter } from "next/navigation";
// // import { useEffect, useMemo, useRef, useState } from "react";
// // import { z } from "zod";

// // const TRACKED_FIELDS = [
// //   "course_id",
// //   "chapter_id",
// //   "title",
// //   "material_type",
// //   "file",
// //   "file_size_mb",
// //   "page_count",
// //   "slide_count",
// //   "learning_objectives",
// //   "description",
// //   "is_downloadable",
// //   "is_enabled",
// // ];

// // const MATERIAL_TYPE_OPTIONS = [
// //   { label: "PDF Document", value: "pdf" },
// //   { label: "Presentation (Slides)", value: "slides" },
// //   { label: "Video", value: "video" },
// //   { label: "Other", value: "other" },
// // ];

// // const materialSchema = z
// //   .object({
// //     course_id: z.coerce.string().min(1, "Please select a Course"),
// //     chapter_id: z.coerce.string().optional(),
// //     title: z.string().min(1, "Title is required").max(200, "Title is too long"),
// //     material_type: z.string().min(1, "Material Type is required"),
// //     file: z.any().optional(),
// //     file_size_mb: z
// //       .union([z.number(), z.nan()])
// //       .optional()
// //       .transform((val) => (Number.isNaN(val) ? undefined : val)),
// //     page_count: z
// //       .union([z.number(), z.nan()])
// //       .optional()
// //       .transform((val) => (Number.isNaN(val) ? undefined : val)),
// //     slide_count: z
// //       .union([z.number(), z.nan()])
// //       .optional()
// //       .transform((val) => (Number.isNaN(val) ? undefined : val)),
// //     learning_objectives: z.array(z.string()).optional(),
// //     description: z.string().optional(),
// //     is_downloadable: z.boolean().default(true),
// //     is_enabled: z.boolean().default(true),
// //   })
// //   .superRefine((data, ctx) => {
// //     if (
// //       data.material_type === "pdf" &&
// //       (!data.page_count || data.page_count <= 0)
// //     ) {
// //       ctx.addIssue({
// //         path: ["page_count"],
// //         message: "Page count must be greater than 0 for PDF materials",
// //         code: z.ZodIssueCode.custom,
// //       });
// //     }

// //     if (
// //       data.material_type === "slides" &&
// //       (!data.slide_count || data.slide_count <= 0)
// //     ) {
// //       ctx.addIssue({
// //         path: ["slide_count"],
// //         message: "Slide count must be greater than 0 for slide materials",
// //         code: z.ZodIssueCode.custom,
// //       });
// //     }
// //   });

// // function extractDetailRecord(res) {
// //   return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? null;
// // }

// // function extractDropdownRows(res) {
// //   return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
// // }

// // function normalizeMaterialToForm(material) {
// //   return {
// //     course_id: material?.context?.course?.id
// //       ? String(material.context.course.id)
// //       : material?.course?.id
// //         ? String(material.course.id)
// //         : material?.course_id
// //           ? String(material.course_id)
// //           : "",
// //     chapter_id: material?.context?.chapter?.id
// //       ? String(material.context.chapter.id)
// //       : material?.chapter?.id
// //         ? String(material.chapter.id)
// //         : material?.chapter_id
// //           ? String(material.chapter_id)
// //           : "",
// //     title: material?.title || "",
// //     material_type: material?.material_type || "",
// //     file: null,
// //     file_size_mb:
// //       material?.file?.size_mb ??
// //       (material?.file_size_mb === null || material?.file_size_mb === undefined
// //         ? ""
// //         : material.file_size_mb),
// //     page_count:
// //       material?.file?.page_count ??
// //       (material?.page_count === null || material?.page_count === undefined
// //         ? ""
// //         : material.page_count),
// //     slide_count:
// //       material?.file?.slide_count ??
// //       (material?.slide_count === null || material?.slide_count === undefined
// //         ? ""
// //         : material.slide_count),
// //     learning_objectives: Array.isArray(material?.learning_objectives)
// //       ? material.learning_objectives
// //       : [],
// //     description: material?.description || "",
// //     is_downloadable:
// //       material?.flags?.is_downloadable ?? !!material?.is_downloadable,
// //     is_enabled: material?.flags?.is_enabled ?? !!material?.is_enabled,
// //   };
// // }

// // function toComparable(values) {
// //   return {
// //     ...values,
// //     chapter_id: values.chapter_id || "",
// //     file:
// //       typeof values.file === "string" ? values.file : values.file?.name || "",
// //     learning_objectives: Array.isArray(values.learning_objectives)
// //       ? [...values.learning_objectives].map((x) => String(x).trim())
// //       : [],
// //   };
// // }

// // function getChangedFields(initialValues, currentValues) {
// //   const initial = toComparable(initialValues);
// //   const current = toComparable(currentValues);

// //   const changed = {};

// //   TRACKED_FIELDS.forEach((key) => {
// //     const oldVal = initial[key];
// //     const newVal = current[key];

// //     if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
// //       changed[key] = currentValues[key];
// //     }
// //   });

// //   return changed;
// // }

// // function buildMaterialPayload(values) {
// //   return {
// //     course_id: Number(values.course_id),
// //     chapter_id: values.chapter_id ? Number(values.chapter_id) : null,
// //     title: values.title,
// //     material_type: values.material_type,
// //     page_count:
// //       values.material_type === "pdf"
// //         ? values.page_count === ""
// //           ? null
// //           : Number(values.page_count)
// //         : null,
// //     slide_count:
// //       values.material_type === "slides"
// //         ? values.slide_count === ""
// //           ? null
// //           : Number(values.slide_count)
// //         : null,
// //     file_size_mb:
// //       values.file_size_mb === "" ? null : Number(values.file_size_mb),
// //     learning_objectives: Array.isArray(values.learning_objectives)
// //       ? values.learning_objectives
// //       : [],
// //     description: values.description || "",
// //     is_downloadable: !!values.is_downloadable,
// //     is_enabled: !!values.is_enabled,
// //   };
// // }

// // function mapCourseOptions(items = []) {
// //   return items.map((item) => ({
// //     label:
// //       item?.label ||
// //       item?.title ||
// //       item?.name ||
// //       `Course #${item?.value ?? item?.id}`,
// //     value: String(item?.value ?? item?.id ?? ""),
// //     meta: item?.meta || {
// //       code: item?.code || "",
// //     },
// //   }));
// // }

// // function mapChapterOptions(items = []) {
// //   return items.map((item) => ({
// //     label:
// //       item?.label ||
// //       item?.title ||
// //       item?.name ||
// //       `Chapter #${item?.value ?? item?.id}`,
// //     value: String(item?.value ?? item?.id ?? ""),
// //     meta: item?.meta || {},
// //   }));
// // }

// // function formatDateTime(value) {
// //   if (!value) return "—";
// //   try {
// //     return new Date(value).toLocaleString();
// //   } catch {
// //     return value;
// //   }
// // }

// // function prettifyMaterialType(type) {
// //   if (!type) return "—";
// //   if (type === "pdf") return "PDF Document";
// //   if (type === "slides") return "Presentation (Slides)";
// //   if (type === "video") return "Video";
// //   if (type === "other") return "Other";
// //   return type;
// // }

// // function InfoItem({ label, value }) {
// //   return (
// //     <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
// //       <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
// //         {label}
// //       </div>
// //       <div className="mt-0.5 text-sm font-medium text-gray-800 dark:text-gray-100">
// //         {value || "—"}
// //       </div>
// //     </div>
// //   );
// // }

// // function StatPill({ label, value, tone = "default" }) {
// //   const toneClass =
// //     tone === "success"
// //       ? "bg-emerald-50 text-emerald-700 border-emerald-100"
// //       : tone === "warning"
// //         ? "bg-amber-50 text-amber-700 border-amber-100"
// //         : tone === "danger"
// //           ? "bg-rose-50 text-rose-700 border-rose-100"
// //           : "bg-white text-gray-800 border-gray-200";

// //   return (
// //     <div className={`rounded-xl border px-3 py-2 ${toneClass}`}>
// //       <div className="text-[11px] uppercase tracking-wide opacity-70">
// //         {label}
// //       </div>
// //       <div className="mt-1 text-sm font-semibold">{value}</div>
// //     </div>
// //   );
// // }

// // const MaterialDetailMain = ({ id }) => {
// //   const router = useRouter();
// //   const notify = useNotify();

// //   const [values, setValues] = useState(null);
// //   const [initialValues, setInitialValues] = useState(null);
// //   const [errors, setErrors] = useState({});

// //   const hasInitializedRef = useRef(false);

// //   const { data: response, isLoading, isError } = useMaterialDetail(id);
// //   const materialData = useMemo(() => extractDetailRecord(response), [response]);

// //   const { data: coursesRes, isLoading: isLoadingCourses } = useCoursesDropdown({
// //     limit: 500,
// //     offset: 0,
// //     active_only: true,
// //   });

// //   const courseRows = useMemo(() => {
// //     const rows = extractDropdownRows(coursesRes);
// //     return Array.isArray(rows) ? rows : [];
// //   }, [coursesRes]);

// //   const coursesOptions = useMemo(() => {
// //     return mapCourseOptions(courseRows);
// //   }, [courseRows]);

// //   const { data: chaptersRes, isLoading: isLoadingChapters } =
// //     useChaptersDropdown(
// //       {
// //         course_id: values?.course_id,
// //         limit: 500,
// //         offset: 0,
// //         active_only: true,
// //       },
// //       { enabled: !!values?.course_id }
// //     );

// //   const chapterRows = useMemo(() => {
// //     const rows = extractDropdownRows(chaptersRes);
// //     return Array.isArray(rows) ? rows : [];
// //   }, [chaptersRes]);

// //   const chapterOptions = useMemo(() => {
// //     return mapChapterOptions(chapterRows);
// //   }, [chapterRows]);

// //   useEffect(() => {
// //     if (!materialData) return;

// //     const normalized = normalizeMaterialToForm(materialData);

// //     if (!hasInitializedRef.current) {
// //       setValues(normalized);
// //       setInitialValues(normalized);
// //       setErrors({});
// //       hasInitializedRef.current = true;
// //       return;
// //     }

// //     if (!initialValues) {
// //       setValues(normalized);
// //       setInitialValues(normalized);
// //     }
// //   }, [materialData, initialValues]);

// //   const changedFields = useMemo(() => {
// //     if (!values || !initialValues) return {};
// //     return getChangedFields(initialValues, values);
// //   }, [initialValues, values]);

// //   const isDirty = Object.keys(changedFields).length > 0;

// //   const updateMutation = useUpdateMaterial();
// //   const deleteMutation = useDeleteMaterial();

// //   const fileInfo = materialData?.file || {};
// //   const context = materialData?.context || {};
// //   const flags = materialData?.flags || {};
// //   const stats = materialData?.stats || {};

// //   const canReadFile = Boolean(fileInfo?.read_url);
// //   const canDownloadFile =
// //     Boolean(fileInfo?.download_url) &&
// //     (flags?.is_downloadable ?? values?.is_downloadable);

// //   const handleOpenRead = () => {
// //     if (!fileInfo?.read_url) {
// //       notify.warning("No file available to read");
// //       return;
// //     }
// //     window.open(fileInfo.read_url, "_blank", "noopener,noreferrer");
// //   };

// //   const handleOpenDownload = () => {
// //     if (!fileInfo?.download_url) {
// //       notify.warning("No file available to download");
// //       return;
// //     }
// //     window.open(fileInfo.download_url, "_blank", "noopener,noreferrer");
// //   };

// //   const handleChange = (field, value) => {
// //     setValues((prev) => {
// //       const next = { ...prev, [field]: value };

// //       if (field === "course_id") {
// //         next.chapter_id = "";
// //       }

// //       if (field === "material_type") {
// //         next.page_count = "";
// //         next.slide_count = "";
// //       }

// //       if (field === "file" && value?.size) {
// //         next.file_size_mb = Number((value.size / (1024 * 1024)).toFixed(2));
// //       }

// //       return next;
// //     });

// //     if (errors[field]) {
// //       setErrors((prev) => ({ ...prev, [field]: null }));
// //     }
// //   };

// //   const handleSave = (e) => {
// //     e?.preventDefault?.();
// //     if (!values) return;

// //     setErrors({});

// //     const parsedValues = {
// //       ...values,
// //       file_size_mb:
// //         values.file_size_mb === "" ? undefined : Number(values.file_size_mb),
// //       page_count:
// //         values.page_count === "" ? undefined : Number(values.page_count),
// //       slide_count:
// //         values.slide_count === "" ? undefined : Number(values.slide_count),
// //     };

// //     const result = materialSchema.safeParse(parsedValues);

// //     if (!result.success) {
// //       const fieldErrors = {};
// //       result.error.issues.forEach((issue) => {
// //         const key = issue.path[0];
// //         if (!fieldErrors[key]) {
// //           fieldErrors[key] = issue.message;
// //         }
// //       });
// //       setErrors(fieldErrors);
// //       notify.error("Please fix the highlighted fields");
// //       return;
// //     }

// //     if (!isDirty) {
// //       notify.warning("No changes in document");
// //       return;
// //     }

// //     const fullPayload = buildMaterialPayload(values);
// //     const changedOnly = getChangedFields(initialValues, values);
// //     const payload = { ...changedOnly };

// //     if ("material_type" in changedOnly) {
// //       payload.material_type = fullPayload.material_type;
// //       payload.page_count = fullPayload.page_count;
// //       payload.slide_count = fullPayload.slide_count;
// //     }

// //     if ("course_id" in changedOnly) payload.course_id = fullPayload.course_id;
// //     if ("chapter_id" in changedOnly) payload.chapter_id = fullPayload.chapter_id;
// //     if ("file_size_mb" in changedOnly) payload.file_size_mb = fullPayload.file_size_mb;

// //     let fileToUpload = undefined;
// //     if ("file" in changedOnly) {
// //       fileToUpload = values.file;
// //       delete payload.file;
// //     }

// //     updateMutation.mutate(
// //       { id, payload, file: fileToUpload },
// //       {
// //         onSuccess: () => {
// //           notify.success("Material updated successfully");

// //           const nextValues = {
// //             ...values,
// //             ...changedOnly,
// //           };

// //           setValues(nextValues);
// //           setInitialValues(nextValues);
// //         },
// //         onError: (error) => {
// //           const msg =
// //             error?.response?.data?.message ||
// //             error?.message ||
// //             "Failed to save material";
// //           notify.error(String(msg));
// //         },
// //       }
// //     );
// //   };

// //   const detailMenuOptions = useMemo(
// //     () => [
// //       {
// //         label: "Print",
// //         action: () => window.print(),
// //       },
// //       {
// //         label: "Delete",
// //         action: () => {
// //           if (confirm("Are you sure you want to delete this material?")) {
// //             deleteMutation.mutate(id, {
// //               onSuccess: () => {
// //                 notify.success("Document deleted");
// //                 router.push("/admin/dashboards/admin-academic/materials");
// //               },
// //               onError: (err) =>
// //                 notify.error(err?.message || "Failed to delete material"),
// //             });
// //           }
// //         },
// //       },
// //     ],
// //     [deleteMutation, id, notify, router]
// //   );

// //   const headerActions = (
// //     <>
// //       <button
// //         type="button"
// //         onClick={handleOpenRead}
// //         disabled={!canReadFile}
// //         className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
// //       >
// //         Read
// //       </button>

// //       <button
// //         type="button"
// //         onClick={handleOpenDownload}
// //         disabled={!canDownloadFile}
// //         className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
// //       >
// //         Download
// //       </button>

// //       <button
// //         type="button"
// //         onClick={() => router.push("/admin/dashboards/admin-academic/materials")}
// //         className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
// //       >
// //         Back
// //       </button>
// //     </>
// //   );

// //   const topContent = (
// //     <div className="space-y-4">
// //       <div className="flex flex-wrap gap-2">
// //         <StatPill
// //           label="Type"
// //           value={prettifyMaterialType(materialData?.material_type)}
// //         />
// //         <StatPill
// //           label="Status"
// //           value={(flags?.is_enabled ?? values?.is_enabled) ? "Enabled" : "Disabled"}
// //           tone={(flags?.is_enabled ?? values?.is_enabled) ? "success" : "danger"}
// //         />
// //         <StatPill
// //           label="Download"
// //           value={
// //             (flags?.is_downloadable ?? values?.is_downloadable)
// //               ? "Allowed"
// //               : "Disabled"
// //           }
// //           tone={(flags?.is_downloadable ?? values?.is_downloadable) ? "success" : "warning"}
// //         />
// //         <StatPill
// //           label="File Size"
// //           value={
// //             fileInfo?.size_mb !== null && fileInfo?.size_mb !== undefined
// //               ? `${fileInfo.size_mb} MB`
// //               : values?.file_size_mb
// //                 ? `${values.file_size_mb} MB`
// //                 : "—"
// //           }
// //         />
// //         <StatPill label="Views" value={stats?.view_count ?? 0} />
// //         <StatPill label="Downloads" value={stats?.download_count ?? 0} />
// //       </div>

// //       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
// //         <InfoItem label="Department" value={context?.department?.name} />
// //         <InfoItem
// //           label="Course"
// //           value={
// //             context?.course
// //               ? `${context.course.code} - ${context.course.title}`
// //               : "—"
// //           }
// //         />
// //         <InfoItem
// //           label="Chapter"
// //           value={
// //             context?.chapter
// //               ? `${context.chapter.number}. ${context.chapter.title}`
// //               : "—"
// //           }
// //         />
// //         <InfoItem
// //           label="Semester / Year"
// //           value={
// //             context?.semester && context?.academic_year
// //               ? `${context.semester.name} • ${context.academic_year.name}`
// //               : context?.semester?.name || context?.academic_year?.name || "—"
// //           }
// //         />
// //         <InfoItem
// //           label="Extension"
// //           value={fileInfo?.extension?.toUpperCase() || "—"}
// //         />
// //         <InfoItem
// //           label={
// //             values?.material_type === "slides" ? "Slide Count" : "Page Count"
// //           }
// //           value={
// //             values?.material_type === "slides"
// //               ? fileInfo?.slide_count ?? values?.slide_count ?? "—"
// //               : fileInfo?.page_count ?? values?.page_count ?? "—"
// //           }
// //         />
// //         <InfoItem label="Created At" value={formatDateTime(materialData?.created_at)} />
// //         <InfoItem label="Updated At" value={formatDateTime(materialData?.updated_at)} />
// //       </div>

// //       <div className="text-sm text-gray-600 dark:text-gray-300">
// //         {materialData?.description || "No description added for this material yet."}
// //       </div>
// //     </div>
// //   );

// //   const countField =
// //     values?.material_type === "pdf"
// //       ? {
// //           name: "page_count",
// //           label: "Page Count",
// //           type: "number",
// //           layout: "third",
// //           placeholder: "e.g., 120",
// //         }
// //       : values?.material_type === "slides"
// //         ? {
// //             name: "slide_count",
// //             label: "Slide Count",
// //             type: "number",
// //             layout: "third",
// //             placeholder: "e.g., 45",
// //           }
// //         : null;

// //   const currentFileName =
// //     typeof values?.file === "object" && values?.file?.name
// //       ? values.file.name
// //       : fileInfo?.download_url
// //         ? fileInfo.download_url.split("/").pop()
// //         : fileInfo?.read_url
// //           ? fileInfo.read_url.split("/").pop()
// //           : "Current file";

// //   const fileMetaText = [
// //     fileInfo?.extension ? fileInfo.extension.toUpperCase() : null,
// //     fileInfo?.size_mb !== null && fileInfo?.size_mb !== undefined
// //       ? `${fileInfo.size_mb} MB`
// //       : null,
// //     fileInfo?.slide_count ? `${fileInfo.slide_count} slides` : null,
// //     fileInfo?.page_count ? `${fileInfo.page_count} pages` : null,
// //   ]
// //     .filter(Boolean)
// //     .join(" • ");

// //   const formFields = useMemo(
// //     () => [
// //       {
// //         name: "title",
// //         label: "Title",
// //         type: "text",
// //         required: true,
// //         layout: "full",
// //         placeholder: "e.g., Lecture 202",
// //       },
// //       {
// //         name: "course_id",
// //         label: "Course",
// //         type: "async-dropdown",
// //         required: true,
// //         layout: "half",
// //         placeholder: "Select course",
// //         dropdownProps: {
// //           options: coursesOptions,
// //           isLoading: isLoadingCourses,
// //           hasMore: false,
// //           getSublabel: (opt) =>
// //             opt?.meta?.code ? `Code: ${opt.meta.code}` : "",
// //         },
// //       },
// //       {
// //         name: "chapter_id",
// //         label: "Chapter",
// //         type: "async-dropdown",
// //         required: false,
// //         layout: "half",
// //         placeholder: values?.course_id ? "Select chapter" : "Select course first",
// //         dropdownProps: {
// //           options: chapterOptions,
// //           isLoading: isLoadingChapters,
// //           hasMore: false,
// //         },
// //       },
// //       {
// //         name: "material_type",
// //         label: "Material Type",
// //         type: "async-dropdown",
// //         required: true,
// //         layout: "third",
// //         placeholder: "Select material type",
// //         dropdownProps: {
// //           options: MATERIAL_TYPE_OPTIONS,
// //           isLoading: false,
// //           hasMore: false,
// //         },
// //       },
// //       {
// //         name: "file_size_mb",
// //         label: "File Size (MB)",
// //         type: "number",
// //         layout: "third",
// //         placeholder: "e.g., 12.5",
// //       },
// //       ...(countField ? [countField] : []),
// //       {
// //         name: "file",
// //         label: "File",
// //         type: "file",
// //         required: false,
// //         layout: "full",
// //         sizeField: "file_size_mb",
// //         fileProps: {
// //           buttonLabel: "Replace file",
// //           helperText:
// //             "Upload a new version of this material. File size updates automatically.",
// //           currentFileName,
// //           readUrl: fileInfo?.read_url || "",
// //           downloadUrl: fileInfo?.download_url || "",
// //           metaText: fileMetaText,
// //         },
// //       },
// //       {
// //         name: "learning_objectives",
// //         label: "Learning Objectives",
// //         type: "tags",
// //         layout: "full",
// //         placeholder: "Type objective and press Enter",
// //       },
// //       {
// //         name: "description",
// //         label: "Description",
// //         type: "textarea",
// //         layout: "full",
// //         required: false,
// //         placeholder: "Short summary...",
// //       },
// //       {
// //         name: "is_downloadable",
// //         label: "Download Access",
// //         type: "checkbox",
// //         layout: "half",
// //         checkboxLabel: "Allow Download",
// //         checkboxDescription: "Admins and allowed users can download this material.",
// //       },
// //       {
// //         name: "is_enabled",
// //         label: "Visibility",
// //         type: "checkbox",
// //         layout: "half",
// //         checkboxLabel: "Enabled",
// //         checkboxDescription: "Visible and active in the system.",
// //       },
// //     ],
// //     [
// //       coursesOptions,
// //       isLoadingCourses,
// //       chapterOptions,
// //       isLoadingChapters,
// //       values?.course_id,
// //       countField,
// //       currentFileName,
// //       fileInfo?.read_url,
// //       fileInfo?.download_url,
// //       fileMetaText,
// //     ]
// //   );

// //   const formTitle = values?.title ? `${id} - ${values.title}` : "Loading...";
// //   const formStatus = updateMutation.isPending
// //     ? "Saving..."
// //     : isDirty
// //       ? "Not Saved"
// //       : "Saved";

// //   if (isLoading || !values) {
// //     return (
// //       <div className="p-10 flex items-center justify-center">Loading...</div>
// //     );
// //   }

// //   if (isError) {
// //     return (
// //       <div className="p-10 flex items-center justify-center text-red-500">
// //         Failed to load material.
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="max-w-7xl mx-auto w-full">
// //       <FrappeForm
// //         title={formTitle}
// //         status={formStatus}
// //         fields={formFields}
// //         menuOptions={detailMenuOptions}
// //         values={values}
// //         errors={errors}
// //         onChange={handleChange}
// //         onSave={handleSave}
// //         isSaving={updateMutation.isPending}
// //         headerActions={headerActions}
// //         topContent={topContent}
// //       />
// //     </div>
// //   );
// // };

// // export default MaterialDetailMain;
// "use client";

// import FrappeForm from "@/components/shared/forms/FrappeForm";
// import {
//   useChaptersDropdown,
//   useCoursesDropdown,
// } from "@/features/academic/hooks";
// import {
//   useDeleteMaterial,
//   useMaterialDetail,
//   useUpdateMaterial,
// } from "@/features/materials/hooks";
// import useNotify from "@/hooks/useNotify";
// import { useRouter } from "next/navigation";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { z } from "zod";

// const TRACKED_FIELDS = [
//   "course_id",
//   "chapter_id",
//   "title",
//   "material_type",
//   "file",
//   "file_size_mb",
//   "page_count",
//   "slide_count",
//   "learning_objectives",
//   "description",
//   "is_downloadable",
//   "is_enabled",
// ];

// const MATERIAL_TYPE_OPTIONS = [
//   { label: "PDF Document", value: "pdf" },
//   { label: "Presentation (Slides)", value: "slides" },
//   { label: "Video", value: "video" },
//   { label: "Other", value: "other" },
// ];

// const materialSchema = z
//   .object({
//     course_id: z.coerce.string().min(1, "Please select a Course"),
//     chapter_id: z.coerce.string().optional(),
//     title: z.string().min(1, "Title is required").max(200, "Title is too long"),
//     material_type: z.string().min(1, "Material Type is required"),
//     file: z.any().optional(),
//     file_size_mb: z
//       .union([z.number(), z.nan()])
//       .optional()
//       .transform((val) => (Number.isNaN(val) ? undefined : val)),
//     page_count: z
//       .union([z.number(), z.nan()])
//       .optional()
//       .transform((val) => (Number.isNaN(val) ? undefined : val)),
//     slide_count: z
//       .union([z.number(), z.nan()])
//       .optional()
//       .transform((val) => (Number.isNaN(val) ? undefined : val)),
//     learning_objectives: z.array(z.string()).optional(),
//     description: z.string().optional(),
//     is_downloadable: z.boolean().default(true),
//     is_enabled: z.boolean().default(true),
//   })
//   .superRefine((data, ctx) => {
//     if (
//       data.material_type === "pdf" &&
//       (!data.page_count || data.page_count <= 0)
//     ) {
//       ctx.addIssue({
//         path: ["page_count"],
//         message: "Page count must be greater than 0 for PDF materials",
//         code: z.ZodIssueCode.custom,
//       });
//     }

//     if (
//       data.material_type === "slides" &&
//       (!data.slide_count || data.slide_count <= 0)
//     ) {
//       ctx.addIssue({
//         path: ["slide_count"],
//         message: "Slide count must be greater than 0 for slide materials",
//         code: z.ZodIssueCode.custom,
//       });
//     }
//   });

// function extractDetailRecord(res) {
//   return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? null;
// }

// function extractDropdownRows(res) {
//   return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
// }

// function normalizeMaterialToForm(material) {
//   return {
//     course_id: material?.context?.course?.id
//       ? String(material.context.course.id)
//       : material?.course?.id
//         ? String(material.course.id)
//         : material?.course_id
//           ? String(material.course_id)
//           : "",
//     chapter_id: material?.context?.chapter?.id
//       ? String(material.context.chapter.id)
//       : material?.chapter?.id
//         ? String(material.chapter.id)
//         : material?.chapter_id
//           ? String(material.chapter_id)
//           : "",
//     title: material?.title || "",
//     material_type: material?.material_type || "",
//     file: null,
//     file_size_mb:
//       material?.file?.size_mb ??
//       (material?.file_size_mb === null || material?.file_size_mb === undefined
//         ? ""
//         : material.file_size_mb),
//     page_count:
//       material?.file?.page_count ??
//       (material?.page_count === null || material?.page_count === undefined
//         ? ""
//         : material.page_count),
//     slide_count:
//       material?.file?.slide_count ??
//       (material?.slide_count === null || material?.slide_count === undefined
//         ? ""
//         : material.slide_count),
//     learning_objectives: Array.isArray(material?.learning_objectives)
//       ? material.learning_objectives
//       : [],
//     description: material?.description || "",
//     is_downloadable:
//       material?.flags?.is_downloadable ?? !!material?.is_downloadable,
//     is_enabled: material?.flags?.is_enabled ?? !!material?.is_enabled,
//   };
// }

// function toComparable(values) {
//   return {
//     ...values,
//     chapter_id: values.chapter_id || "",
//     file:
//       typeof values.file === "string" ? values.file : values.file?.name || "",
//     learning_objectives: Array.isArray(values.learning_objectives)
//       ? [...values.learning_objectives].map((x) => String(x).trim())
//       : [],
//   };
// }

// function getChangedFields(initialValues, currentValues) {
//   const initial = toComparable(initialValues);
//   const current = toComparable(currentValues);

//   const changed = {};

//   TRACKED_FIELDS.forEach((key) => {
//     const oldVal = initial[key];
//     const newVal = current[key];

//     if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
//       changed[key] = currentValues[key];
//     }
//   });

//   return changed;
// }

// function buildMaterialPayload(values) {
//   return {
//     course_id: Number(values.course_id),
//     chapter_id: values.chapter_id ? Number(values.chapter_id) : null,
//     title: values.title,
//     material_type: values.material_type,
//     page_count:
//       values.material_type === "pdf"
//         ? values.page_count === ""
//           ? null
//           : Number(values.page_count)
//         : null,
//     slide_count:
//       values.material_type === "slides"
//         ? values.slide_count === ""
//           ? null
//           : Number(values.slide_count)
//         : null,
//     file_size_mb:
//       values.file_size_mb === "" ? null : Number(values.file_size_mb),
//     learning_objectives: Array.isArray(values.learning_objectives)
//       ? values.learning_objectives
//       : [],
//     description: values.description || "",
//     is_downloadable: !!values.is_downloadable,
//     is_enabled: !!values.is_enabled,
//   };
// }

// function mapCourseOptions(items = []) {
//   return items.map((item) => ({
//     label:
//       item?.label ||
//       item?.title ||
//       item?.name ||
//       `Course #${item?.value ?? item?.id}`,
//     value: String(item?.value ?? item?.id ?? ""),
//     meta: item?.meta || {
//       code: item?.code || "",
//     },
//   }));
// }

// function mapChapterOptions(items = []) {
//   return items.map((item) => ({
//     label:
//       item?.label ||
//       item?.title ||
//       item?.name ||
//       `Chapter #${item?.value ?? item?.id}`,
//     value: String(item?.value ?? item?.id ?? ""),
//     meta: item?.meta || {},
//   }));
// }

// function formatDateTime(value) {
//   if (!value) return "—";
//   try {
//     return new Date(value).toLocaleString();
//   } catch {
//     return value;
//   }
// }

// function prettifyMaterialType(type) {
//   if (!type) return "—";
//   if (type === "pdf") return "PDF Document";
//   if (type === "slides") return "Presentation (Slides)";
//   if (type === "video") return "Video";
//   if (type === "other") return "Other";
//   return type;
// }

// function InfoItem({ label, value }) {
//   return (
//     <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
//       <div className="text-[11px] uppercase tracking-wide text-gray-500">
//         {label}
//       </div>
//       <div className="mt-0.5 text-sm font-medium text-gray-800">
//         {value || "—"}
//       </div>
//     </div>
//   );
// }

// function StatPill({ label, value, tone = "default" }) {
//   const toneClass =
//     tone === "success"
//       ? "bg-emerald-50 text-emerald-700 border-emerald-100"
//       : tone === "warning"
//         ? "bg-amber-50 text-amber-700 border-amber-100"
//         : tone === "danger"
//           ? "bg-rose-50 text-rose-700 border-rose-100"
//           : "bg-white text-gray-800 border-gray-200";

//   return (
//     <div className={`rounded-xl border px-3 py-2 ${toneClass}`}>
//       <div className="text-[11px] uppercase tracking-wide opacity-70">
//         {label}
//       </div>
//       <div className="mt-1 text-sm font-semibold">{value}</div>
//     </div>
//   );
// }

// const MaterialDetailMain = ({ id }) => {
//   const router = useRouter();
//   const notify = useNotify();

//   const [values, setValues] = useState(null);
//   const [initialValues, setInitialValues] = useState(null);
//   const [errors, setErrors] = useState({});

//   const hasInitializedRef = useRef(false);

//   const { data: response, isLoading, isError } = useMaterialDetail(id);
//   const materialData = useMemo(() => extractDetailRecord(response), [response]);

//   const { data: coursesRes, isLoading: isLoadingCourses } = useCoursesDropdown({
//     limit: 500,
//     offset: 0,
//     active_only: true,
//   });

//   const courseRows = useMemo(() => {
//     const rows = extractDropdownRows(coursesRes);
//     return Array.isArray(rows) ? rows : [];
//   }, [coursesRes]);

//   const coursesOptions = useMemo(() => {
//     return mapCourseOptions(courseRows);
//   }, [courseRows]);

//   const { data: chaptersRes, isLoading: isLoadingChapters } =
//     useChaptersDropdown(
//       {
//         course_id: values?.course_id,
//         limit: 500,
//         offset: 0,
//         active_only: true,
//       },
//       { enabled: !!values?.course_id }
//     );

//   const chapterRows = useMemo(() => {
//     const rows = extractDropdownRows(chaptersRes);
//     return Array.isArray(rows) ? rows : [];
//   }, [chaptersRes]);

//   const chapterOptions = useMemo(() => {
//     return mapChapterOptions(chapterRows);
//   }, [chapterRows]);

//   useEffect(() => {
//     if (!materialData) return;

//     const normalized = normalizeMaterialToForm(materialData);

//     if (!hasInitializedRef.current) {
//       setValues(normalized);
//       setInitialValues(normalized);
//       setErrors({});
//       hasInitializedRef.current = true;
//       return;
//     }

//     if (!initialValues) {
//       setValues(normalized);
//       setInitialValues(normalized);
//     }
//   }, [materialData, initialValues]);

//   const changedFields = useMemo(() => {
//     if (!values || !initialValues) return {};
//     return getChangedFields(initialValues, values);
//   }, [initialValues, values]);

//   const isDirty = Object.keys(changedFields).length > 0;

//   const updateMutation = useUpdateMaterial();
//   const deleteMutation = useDeleteMaterial();

//   const fileInfo = materialData?.file || {};
//   const context = materialData?.context || {};
//   const flags = materialData?.flags || {};
//   const stats = materialData?.stats || {};

//   const canReadFile = Boolean(fileInfo?.read_url);
//   const canDownloadFile =
//     Boolean(fileInfo?.download_url) &&
//     (flags?.is_downloadable ?? values?.is_downloadable);

//   const handleOpenRead = () => {
//     if (!fileInfo?.read_url) {
//       notify.warning("No file available to read");
//       return;
//     }
//     window.open(fileInfo.read_url, "_blank", "noopener,noreferrer");
//   };

//   const handleOpenDownload = () => {
//     if (!fileInfo?.download_url) {
//       notify.warning("No file available to download");
//       return;
//     }
//     window.open(fileInfo.download_url, "_blank", "noopener,noreferrer");
//   };

//   const handleChange = (field, value) => {
//     setValues((prev) => {
//       const next = { ...prev, [field]: value };

//       if (field === "course_id") {
//         next.chapter_id = "";
//       }

//       if (field === "material_type") {
//         next.page_count = "";
//         next.slide_count = "";
//       }

//       if (field === "file" && value?.size) {
//         next.file_size_mb = Number((value.size / (1024 * 1024)).toFixed(2));
//       }

//       return next;
//     });

//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: null }));
//     }
//   };

//   const handleSave = (e) => {
//     e?.preventDefault?.();
//     if (!values) return;

//     setErrors({});

//     const parsedValues = {
//       ...values,
//       file_size_mb:
//         values.file_size_mb === "" ? undefined : Number(values.file_size_mb),
//       page_count:
//         values.page_count === "" ? undefined : Number(values.page_count),
//       slide_count:
//         values.slide_count === "" ? undefined : Number(values.slide_count),
//     };

//     const result = materialSchema.safeParse(parsedValues);

//     if (!result.success) {
//       const fieldErrors = {};
//       result.error.issues.forEach((issue) => {
//         const key = issue.path[0];
//         if (!fieldErrors[key]) {
//           fieldErrors[key] = issue.message;
//         }
//       });
//       setErrors(fieldErrors);
//       notify.error("Please fix the highlighted fields");
//       return;
//     }

//     if (!isDirty) {
//       notify.warning("No changes in document");
//       return;
//     }

//     const fullPayload = buildMaterialPayload(values);
//     const changedOnly = getChangedFields(initialValues, values);
//     const payload = { ...changedOnly };

//     if ("material_type" in changedOnly) {
//       payload.material_type = fullPayload.material_type;
//       payload.page_count = fullPayload.page_count;
//       payload.slide_count = fullPayload.slide_count;
//     }

//     if ("course_id" in changedOnly) payload.course_id = fullPayload.course_id;
//     if ("chapter_id" in changedOnly) payload.chapter_id = fullPayload.chapter_id;
//     if ("file_size_mb" in changedOnly) {
//       payload.file_size_mb = fullPayload.file_size_mb;
//     }

//     let fileToUpload = undefined;
//     if ("file" in changedOnly) {
//       fileToUpload = values.file;
//       delete payload.file;
//     }

//     updateMutation.mutate(
//       { id, payload, file: fileToUpload },
//       {
//         onSuccess: () => {
//           notify.success("Material updated successfully");

//           const nextValues = {
//             ...values,
//             ...changedOnly,
//           };

//           setValues(nextValues);
//           setInitialValues(nextValues);
//         },
//         onError: (error) => {
//           const msg =
//             error?.response?.data?.message ||
//             error?.message ||
//             "Failed to save material";
//           notify.error(String(msg));
//         },
//       }
//     );
//   };

//   const detailMenuOptions = useMemo(
//     () => [
//       {
//         label: "Print",
//         action: () => window.print(),
//       },
//       {
//         label: "Delete",
//         action: () => {
//           if (confirm("Are you sure you want to delete this material?")) {
//             deleteMutation.mutate(id, {
//               onSuccess: () => {
//                 notify.success("Document deleted");
//                 router.push("/admin/dashboards/admin-academic/materials");
//               },
//               onError: (err) =>
//                 notify.error(err?.message || "Failed to delete material"),
//             });
//           }
//         },
//       },
//     ],
//     [deleteMutation, id, notify, router]
//   );

//   const headerActions = (
//     <>
//       <button
//         type="button"
//         onClick={handleOpenRead}
//         disabled={!canReadFile}
//         className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         Read
//       </button>

//       <button
//         type="button"
//         onClick={handleOpenDownload}
//         disabled={!canDownloadFile}
//         className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         Download
//       </button>

//       <button
//         type="button"
//         onClick={() => router.push("/admin/dashboards/admin-academic/materials")}
//         className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
//       >
//         Back
//       </button>
//     </>
//   );

//   const topContent = (
//     <div className="space-y-4">
//       <div className="flex flex-wrap gap-2">
//         <StatPill
//           label="Type"
//           value={prettifyMaterialType(materialData?.material_type)}
//         />
//         <StatPill
//           label="Status"
//           value={(flags?.is_enabled ?? values?.is_enabled) ? "Enabled" : "Disabled"}
//           tone={(flags?.is_enabled ?? values?.is_enabled) ? "success" : "danger"}
//         />
//         <StatPill
//           label="Download"
//           value={
//             (flags?.is_downloadable ?? values?.is_downloadable)
//               ? "Allowed"
//               : "Disabled"
//           }
//           tone={(flags?.is_downloadable ?? values?.is_downloadable) ? "success" : "warning"}
//         />
//         <StatPill
//           label="File Size"
//           value={
//             fileInfo?.size_mb !== null && fileInfo?.size_mb !== undefined
//               ? `${fileInfo.size_mb} MB`
//               : values?.file_size_mb
//                 ? `${values.file_size_mb} MB`
//                 : "—"
//           }
//         />
//         <StatPill label="Views" value={stats?.view_count ?? 0} />
//         <StatPill label="Downloads" value={stats?.download_count ?? 0} />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
//         <InfoItem label="Department" value={context?.department?.name} />
//         <InfoItem
//           label="Course"
//           value={
//             context?.course
//               ? `${context.course.code} - ${context.course.title}`
//               : "—"
//           }
//         />
//         <InfoItem
//           label="Chapter"
//           value={
//             context?.chapter
//               ? `${context.chapter.number}. ${context.chapter.title}`
//               : "—"
//           }
//         />
//         <InfoItem
//           label="Semester / Year"
//           value={
//             context?.semester && context?.academic_year
//               ? `${context.semester.name} • ${context.academic_year.name}`
//               : context?.semester?.name || context?.academic_year?.name || "—"
//           }
//         />
//         <InfoItem
//           label="Extension"
//           value={fileInfo?.extension?.toUpperCase() || "—"}
//         />
//         <InfoItem
//           label={
//             values?.material_type === "slides" ? "Slide Count" : "Page Count"
//           }
//           value={
//             values?.material_type === "slides"
//               ? fileInfo?.slide_count ?? values?.slide_count ?? "—"
//               : fileInfo?.page_count ?? values?.page_count ?? "—"
//           }
//         />
//         <InfoItem label="Created At" value={formatDateTime(materialData?.created_at)} />
//         <InfoItem label="Updated At" value={formatDateTime(materialData?.updated_at)} />
//       </div>

//       <div className="text-sm text-gray-600">
//         {materialData?.description || "No description added for this material yet."}
//       </div>
//     </div>
//   );

//   const countField =
//     values?.material_type === "pdf"
//       ? {
//           name: "page_count",
//           label: "Page Count",
//           type: "number",
//           layout: "third",
//           placeholder: "e.g., 120",
//         }
//       : values?.material_type === "slides"
//         ? {
//             name: "slide_count",
//             label: "Slide Count",
//             type: "number",
//             layout: "third",
//             placeholder: "e.g., 45",
//           }
//         : null;

//   const currentFileName =
//     typeof values?.file === "object" && values?.file?.name
//       ? values.file.name
//       : fileInfo?.download_url
//         ? fileInfo.download_url.split("/").pop()
//         : fileInfo?.read_url
//           ? fileInfo.read_url.split("/").pop()
//           : "";

//   const fileMetaText = [
//     fileInfo?.extension ? fileInfo.extension.toUpperCase() : null,
//     fileInfo?.size_mb !== null && fileInfo?.size_mb !== undefined
//       ? `${fileInfo.size_mb} MB`
//       : null,
//     fileInfo?.slide_count ? `${fileInfo.slide_count} slides` : null,
//     fileInfo?.page_count ? `${fileInfo.page_count} pages` : null,
//   ]
//     .filter(Boolean)
//     .join(" • ");

//   const formFields = useMemo(
//     () => [
//       {
//         name: "title",
//         label: "Title",
//         type: "text",
//         required: true,
//         layout: "full",
//         placeholder: "e.g., Lecture 202",
//       },
//       {
//         section: "Classification",
//         fields: [
//           {
//             name: "course_id",
//             label: "Course",
//             type: "async-dropdown",
//             required: true,
//             layout: "half",
//             placeholder: "Select course",
//             dropdownProps: {
//               options: coursesOptions,
//               isLoading: isLoadingCourses,
//               hasMore: false,
//               getSublabel: (opt) =>
//                 opt?.meta?.code ? `Code: ${opt.meta.code}` : "",
//             },
//           },
//           {
//             name: "chapter_id",
//             label: "Chapter",
//             type: "async-dropdown",
//             required: false,
//             layout: "half",
//             placeholder: values?.course_id
//               ? "Select chapter"
//               : "Select course first",
//             dropdownProps: {
//               options: chapterOptions,
//               isLoading: isLoadingChapters,
//               hasMore: false,
//             },
//           },
//         ],
//       },
//       {
//         section: "Content",
//         fields: [
//           {
//             name: "material_type",
//             label: "Material Type",
//             type: "async-dropdown",
//             required: true,
//             layout: "third",
//             placeholder: "Select material type",
//             dropdownProps: {
//               options: MATERIAL_TYPE_OPTIONS,
//               isLoading: false,
//               hasMore: false,
//             },
//           },
//           {
//             name: "file_size_mb",
//             label: "File Size (MB)",
//             type: "number",
//             layout: "third",
//             placeholder: "e.g., 12.5",
//           },
//           ...(countField ? [countField] : []),
//           {
//             name: "file",
//             label: "File",
//             type: "file",
//             required: false,
//             layout: "full",
//             sizeField: "file_size_mb",
//             fileProps: {
//               buttonLabel: "Replace file",
//               helperText:
//                 "Upload a new version of this material. File size updates automatically.",
//               currentFileName,
//               readUrl: fileInfo?.read_url || "",
//               downloadUrl: fileInfo?.download_url || "",
//               metaText: fileMetaText,
//             },
//           },
//           {
//             name: "learning_objectives",
//             label: "Learning Objectives",
//             type: "tags",
//             layout: "full",
//             placeholder: "Type objective and press Enter",
//           },
//           {
//             name: "description",
//             label: "Description",
//             type: "textarea",
//             layout: "full",
//             required: false,
//             placeholder: "Short summary...",
//           },
//         ],
//       },
//       {
//         section: "Access Control",
//         fields: [
//           {
//             name: "is_downloadable",
//             label: "Download Access",
//             type: "checkbox",
//             layout: "half",
//             checkboxLabel: "Allow Download",
//             checkboxDescription:
//               "Admins and allowed users can download this material.",
//           },
//           {
//             name: "is_enabled",
//             label: "Visibility",
//             type: "checkbox",
//             layout: "half",
//             checkboxLabel: "Enabled",
//             checkboxDescription: "Visible and active in the system.",
//           },
//         ],
//       },
//     ],
//     [
//       coursesOptions,
//       isLoadingCourses,
//       chapterOptions,
//       isLoadingChapters,
//       values?.course_id,
//       countField,
//       currentFileName,
//       fileInfo?.read_url,
//       fileInfo?.download_url,
//       fileMetaText,
//     ]
//   );

//   const formTitle = values?.title ? `${id} - ${values.title}` : "Loading...";
//   const formStatus = updateMutation.isPending
//     ? "Saving..."
//     : isDirty
//       ? "Not Saved"
//       : "Saved";

//   if (isLoading || !values) {
//     return (
//       <div className="p-10 flex items-center justify-center">Loading...</div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="p-10 flex items-center justify-center text-red-500">
//         Failed to load material.
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto w-full">
//       <FrappeForm
//         title={formTitle}
//         status={formStatus}
//         fields={formFields}
//         menuOptions={detailMenuOptions}
//         values={values}
//         errors={errors}
//         onChange={handleChange}
//         onSave={handleSave}
//         isSaving={updateMutation.isPending}
//         headerActions={headerActions}
//         topContent={topContent}
//       />
//     </div>
//   );
// };

// export default MaterialDetailMain;
"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import {
  useChaptersDropdown,
  useCoursesDropdown,
} from "@/features/academic/hooks";
import {
  useDeleteMaterial,
  useMaterialDetail,
  useUpdateMaterial,
} from "@/features/materials/hooks";
import useNotify from "@/hooks/useNotify";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

const TRACKED_FIELDS = [
  "course_id",
  "chapter_id",
  "title",
  "material_type",
  "file",
  "file_size_mb",
  "page_count",
  "slide_count",
  "learning_objectives",
  "description",
  "is_downloadable",
  "is_enabled",
];

const MATERIAL_TYPE_OPTIONS = [
  { label: "PDF Document", value: "pdf" },
  { label: "Presentation (Slides)", value: "slides" },
  { label: "Video", value: "video" },
  { label: "Other", value: "other" },
];

const materialSchema = z
  .object({
    course_id: z.coerce.string().min(1, "Please select a Course"),
    chapter_id: z.coerce.string().optional(),
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    material_type: z.string().min(1, "Material Type is required"),
    file: z.any().optional(),
    file_size_mb: z
      .union([z.number(), z.nan()])
      .optional()
      .transform((val) => (Number.isNaN(val) ? undefined : val)),
    page_count: z
      .union([z.number(), z.nan()])
      .optional()
      .transform((val) => (Number.isNaN(val) ? undefined : val)),
    slide_count: z
      .union([z.number(), z.nan()])
      .optional()
      .transform((val) => (Number.isNaN(val) ? undefined : val)),
    learning_objectives: z.array(z.string()).optional(),
    description: z.string().optional(),
    is_downloadable: z.boolean().default(true),
    is_enabled: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (
      data.material_type === "pdf" &&
      (!data.page_count || data.page_count <= 0)
    ) {
      ctx.addIssue({
        path: ["page_count"],
        message: "Page count must be greater than 0 for PDF materials",
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      data.material_type === "slides" &&
      (!data.slide_count || data.slide_count <= 0)
    ) {
      ctx.addIssue({
        path: ["slide_count"],
        message: "Slide count must be greater than 0 for slide materials",
        code: z.ZodIssueCode.custom,
      });
    }
  });

function extractDetailRecord(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? null;
}

function extractDropdownRows(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
}

function normalizeMaterialToForm(material) {
  return {
    course_id: material?.context?.course?.id
      ? String(material.context.course.id)
      : material?.course?.id
        ? String(material.course.id)
        : material?.course_id
          ? String(material.course_id)
          : "",
    chapter_id: material?.context?.chapter?.id
      ? String(material.context.chapter.id)
      : material?.chapter?.id
        ? String(material.chapter.id)
        : material?.chapter_id
          ? String(material.chapter_id)
          : "",
    title: material?.title || "",
    material_type: material?.material_type || "",
    file: null,
    file_size_mb:
      material?.file?.size_mb ??
      (material?.file_size_mb === null || material?.file_size_mb === undefined
        ? ""
        : material.file_size_mb),
    page_count:
      material?.file?.page_count ??
      (material?.page_count === null || material?.page_count === undefined
        ? ""
        : material.page_count),
    slide_count:
      material?.file?.slide_count ??
      (material?.slide_count === null || material?.slide_count === undefined
        ? ""
        : material.slide_count),
    learning_objectives: Array.isArray(material?.learning_objectives)
      ? material.learning_objectives
      : [],
    description: material?.description || "",
    is_downloadable:
      material?.flags?.is_downloadable ?? !!material?.is_downloadable,
    is_enabled: material?.flags?.is_enabled ?? !!material?.is_enabled,
  };
}

function toComparable(values) {
  return {
    ...values,
    chapter_id: values.chapter_id || "",
    file:
      typeof values.file === "string" ? values.file : values.file?.name || "",
    learning_objectives: Array.isArray(values.learning_objectives)
      ? [...values.learning_objectives].map((x) => String(x).trim())
      : [],
  };
}

function getChangedFields(initialValues, currentValues) {
  const initial = toComparable(initialValues);
  const current = toComparable(currentValues);

  const changed = {};

  TRACKED_FIELDS.forEach((key) => {
    const oldVal = initial[key];
    const newVal = current[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changed[key] = currentValues[key];
    }
  });

  return changed;
}

function buildMaterialPayload(values) {
  return {
    course_id: Number(values.course_id),
    chapter_id: values.chapter_id ? Number(values.chapter_id) : null,
    title: values.title,
    material_type: values.material_type,
    page_count:
      values.material_type === "pdf"
        ? values.page_count === ""
          ? null
          : Number(values.page_count)
        : null,
    slide_count:
      values.material_type === "slides"
        ? values.slide_count === ""
          ? null
          : Number(values.slide_count)
        : null,
    file_size_mb:
      values.file_size_mb === "" ? null : Number(values.file_size_mb),
    learning_objectives: Array.isArray(values.learning_objectives)
      ? values.learning_objectives
      : [],
    description: values.description || "",
    is_downloadable: !!values.is_downloadable,
    is_enabled: !!values.is_enabled,
  };
}

function mapCourseOptions(items = []) {
  return items.map((item) => ({
    label:
      item?.label ||
      item?.title ||
      item?.name ||
      `Course #${item?.value ?? item?.id}`,
    value: String(item?.value ?? item?.id ?? ""),
    meta: item?.meta || {
      code: item?.code || "",
    },
  }));
}

function mapChapterOptions(items = []) {
  return items.map((item) => ({
    label:
      item?.label ||
      item?.title ||
      item?.name ||
      `Chapter #${item?.value ?? item?.id}`,
    value: String(item?.value ?? item?.id ?? ""),
    meta: item?.meta || {},
  }));
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function prettifyMaterialType(type) {
  if (!type) return "—";
  if (type === "pdf") return "PDF Document";
  if (type === "slides") return "Presentation (Slides)";
  if (type === "video") return "Video";
  if (type === "other") return "Other";
  return type;
}

const MaterialDetailMain = ({ id }) => {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const hasInitializedRef = useRef(false);

  const { data: response, isLoading, isError } = useMaterialDetail(id);
  const materialData = useMemo(() => extractDetailRecord(response), [response]);

  const { data: coursesRes, isLoading: isLoadingCourses } = useCoursesDropdown({
    limit: 500,
    offset: 0,
    active_only: true,
  });

  const courseRows = useMemo(() => {
    const rows = extractDropdownRows(coursesRes);
    return Array.isArray(rows) ? rows : [];
  }, [coursesRes]);

  const coursesOptions = useMemo(() => {
    return mapCourseOptions(courseRows);
  }, [courseRows]);

  const { data: chaptersRes, isLoading: isLoadingChapters } =
    useChaptersDropdown(
      {
        course_id: values?.course_id,
        limit: 500,
        offset: 0,
        active_only: true,
      },
      { enabled: !!values?.course_id }
    );

  const chapterRows = useMemo(() => {
    const rows = extractDropdownRows(chaptersRes);
    return Array.isArray(rows) ? rows : [];
  }, [chaptersRes]);

  const chapterOptions = useMemo(() => {
    return mapChapterOptions(chapterRows);
  }, [chapterRows]);

  useEffect(() => {
    if (!materialData) return;

    const normalized = normalizeMaterialToForm(materialData);

    if (!hasInitializedRef.current) {
      setValues(normalized);
      setInitialValues(normalized);
      setErrors({});
      hasInitializedRef.current = true;
      return;
    }

    if (!initialValues) {
      setValues(normalized);
      setInitialValues(normalized);
    }
  }, [materialData, initialValues]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const isDirty = Object.keys(changedFields).length > 0;

  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  const fileInfo = materialData?.file || {};
  const context = materialData?.context || {};
  const flags = materialData?.flags || {};
  const stats = materialData?.stats || {};

  const canReadFile = Boolean(fileInfo?.read_url);
  const canDownloadFile =
    Boolean(fileInfo?.download_url) &&
    (flags?.is_downloadable ?? values?.is_downloadable);

  const handleOpenRead = () => {
    if (!fileInfo?.read_url) {
      notify.warning("No file available to read");
      return;
    }
    window.open(fileInfo.read_url, "_blank", "noopener,noreferrer");
  };

  const handleOpenDownload = () => {
    if (!fileInfo?.download_url) {
      notify.warning("No file available to download");
      return;
    }
    window.open(fileInfo.download_url, "_blank", "noopener,noreferrer");
  };

  const handleChange = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "course_id") {
        next.chapter_id = "";
      }

      if (field === "material_type") {
        next.page_count = "";
        next.slide_count = "";
      }

      if (field === "file" && value?.size) {
        next.file_size_mb = Number((value.size / (1024 * 1024)).toFixed(2));
      }

      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    if (!values) return;

    setErrors({});

    const parsedValues = {
      ...values,
      file_size_mb:
        values.file_size_mb === "" ? undefined : Number(values.file_size_mb),
      page_count:
        values.page_count === "" ? undefined : Number(values.page_count),
      slide_count:
        values.slide_count === "" ? undefined : Number(values.slide_count),
    };

    const result = materialSchema.safeParse(parsedValues);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      });
      setErrors(fieldErrors);
      notify.error("Please fix the highlighted fields");
      return;
    }

    if (!isDirty) {
      notify.warning("No changes in document");
      return;
    }

    const fullPayload = buildMaterialPayload(values);
    const changedOnly = getChangedFields(initialValues, values);
    const payload = { ...changedOnly };

    if ("material_type" in changedOnly) {
      payload.material_type = fullPayload.material_type;
      payload.page_count = fullPayload.page_count;
      payload.slide_count = fullPayload.slide_count;
    }

    if ("course_id" in changedOnly) payload.course_id = fullPayload.course_id;
    if ("chapter_id" in changedOnly) payload.chapter_id = fullPayload.chapter_id;
    if ("file_size_mb" in changedOnly) {
      payload.file_size_mb = fullPayload.file_size_mb;
    }

    let fileToUpload = undefined;
    if ("file" in changedOnly) {
      fileToUpload = values.file;
      delete payload.file;
    }

    updateMutation.mutate(
      { id, payload, file: fileToUpload },
      {
        onSuccess: () => {
          notify.success("Material updated successfully");

          const nextValues = {
            ...values,
            ...changedOnly,
          };

          setValues(nextValues);
          setInitialValues(nextValues);
        },
        onError: (error) => {
          const msg =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to save material";
          notify.error(String(msg));
        },
      }
    );
  };

  const detailMenuOptions = useMemo(
    () => [
      {
        label: "Print",
        action: () => window.print(),
      },
      {
        label: "Delete",
        action: () => {
          if (confirm("Are you sure you want to delete this material?")) {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                notify.success("Document deleted");
                router.push("/admin/dashboards/admin-academic/materials");
              },
              onError: (err) =>
                notify.error(err?.message || "Failed to delete material"),
            });
          }
        },
      },
    ],
    [deleteMutation, id, notify, router]
  );

  const headerActions = (
    <>
      <button
        type="button"
        onClick={handleOpenRead}
        disabled={!canReadFile}
        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Read
      </button>

      <button
        type="button"
        onClick={handleOpenDownload}
        disabled={!canDownloadFile}
        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Download
      </button>

      <button
        type="button"
        onClick={() => router.push("/admin/dashboards/admin-academic/materials")}
        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Back
      </button>
    </>
  );

  // Simple sidebar: just a list of metadata
  const Sidebar = () => {
    const type = prettifyMaterialType(materialData?.material_type);
    const status = (flags?.is_enabled ?? values?.is_enabled)
      ? "Enabled"
      : "Disabled";
    const downloadAllowed = (flags?.is_downloadable ?? values?.is_downloadable)
      ? "Allowed"
      : "Disabled";
    const fileSize =
      fileInfo?.size_mb !== null && fileInfo?.size_mb !== undefined
        ? `${fileInfo.size_mb} MB`
        : values?.file_size_mb
          ? `${values.file_size_mb} MB`
          : "—";
    const views = stats?.view_count ?? 0;
    const downloads = stats?.download_count ?? 0;
    const extension = fileInfo?.extension?.toUpperCase() || "—";
    const slideCount =
      values?.material_type === "slides"
        ? fileInfo?.slide_count ?? values?.slide_count ?? "—"
        : "—";

    return (
      <div className="w-64 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-500">Type</div>
            <div className="text-gray-800">{type}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Status</div>
            <div className="text-gray-800">{status}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Download</div>
            <div className="text-gray-800">{downloadAllowed}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">File Size</div>
            <div className="text-gray-800">{fileSize}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Views</div>
            <div className="text-gray-800">{views}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Downloads</div>
            <div className="text-gray-800">{downloads}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Extension</div>
            <div className="text-gray-800">{extension}</div>
          </div>
          {values?.material_type === "slides" && (
            <div>
              <div className="text-xs font-medium text-gray-500">Slide Count</div>
              <div className="text-gray-800">{slideCount}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const countField =
    values?.material_type === "pdf"
      ? {
          name: "page_count",
          label: "Page Count",
          type: "number",
          layout: "third",
          placeholder: "e.g., 120",
        }
      : values?.material_type === "slides"
        ? {
            name: "slide_count",
            label: "Slide Count",
            type: "number",
            layout: "third",
            placeholder: "e.g., 45",
          }
        : null;

  const currentFileName =
    typeof values?.file === "object" && values?.file?.name
      ? values.file.name
      : fileInfo?.download_url
        ? fileInfo.download_url.split("/").pop()
        : fileInfo?.read_url
          ? fileInfo.read_url.split("/").pop()
          : "";

  const fileMetaText = [
    fileInfo?.extension ? fileInfo.extension.toUpperCase() : null,
    fileInfo?.size_mb !== null && fileInfo?.size_mb !== undefined
      ? `${fileInfo.size_mb} MB`
      : null,
    fileInfo?.slide_count ? `${fileInfo.slide_count} slides` : null,
    fileInfo?.page_count ? `${fileInfo.page_count} pages` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const formFields = useMemo(
    () => [
      {
        name: "title",
        label: "Title",
        type: "text",
        required: true,
        layout: "full",
        placeholder: "e.g., Lecture 202",
      },
      {
        section: "Classification",
        fields: [
          {
            name: "course_id",
            label: "Course",
            type: "async-dropdown",
            required: true,
            layout: "half",
            placeholder: "Select course",
            dropdownProps: {
              options: coursesOptions,
              isLoading: isLoadingCourses,
              hasMore: false,
              getSublabel: (opt) =>
                opt?.meta?.code ? `Code: ${opt.meta.code}` : "",
            },
          },
          {
            name: "chapter_id",
            label: "Chapter",
            type: "async-dropdown",
            required: false,
            layout: "half",
            placeholder: values?.course_id
              ? "Select chapter"
              : "Select course first",
            dropdownProps: {
              options: chapterOptions,
              isLoading: isLoadingChapters,
              hasMore: false,
            },
          },
        ],
      },
      {
        section: "Content",
        fields: [
          {
            name: "material_type",
            label: "Material Type",
            type: "async-dropdown",
            required: true,
            layout: "third",
            placeholder: "Select material type",
            dropdownProps: {
              options: MATERIAL_TYPE_OPTIONS,
              isLoading: false,
              hasMore: false,
            },
          },
          {
            name: "file_size_mb",
            label: "File Size (MB)",
            type: "number",
            layout: "third",
            placeholder: "e.g., 12.5",
          },
          ...(countField ? [countField] : []),
          {
            name: "file",
            label: "File",
            type: "file",
            required: false,
            layout: "full",
            sizeField: "file_size_mb",
            fileProps: {
              buttonLabel: "Replace file",
              helperText:
                "Upload a new version of this material. File size updates automatically.",
              currentFileName,
              readUrl: fileInfo?.read_url || "",
              downloadUrl: fileInfo?.download_url || "",
              metaText: fileMetaText,
            },
          },
          {
            name: "learning_objectives",
            label: "Learning Objectives",
            type: "tags",
            layout: "full",
            placeholder: "Type objective and press Enter",
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            layout: "full",
            required: false,
            placeholder: "Short summary...",
          },
        ],
      },
      {
        section: "Access Control",
        fields: [
          {
            name: "is_downloadable",
            label: "Download Access",
            type: "checkbox",
            layout: "half",
            checkboxLabel: "Allow Download",
            checkboxDescription:
              "Admins and allowed users can download this material.",
          },
          {
            name: "is_enabled",
            label: "Visibility",
            type: "checkbox",
            layout: "half",
            checkboxLabel: "Enabled",
            checkboxDescription: "Visible and active in the system.",
          },
        ],
      },
    ],
    [
      coursesOptions,
      isLoadingCourses,
      chapterOptions,
      isLoadingChapters,
      values?.course_id,
      countField,
      currentFileName,
      fileInfo?.read_url,
      fileInfo?.download_url,
      fileMetaText,
    ]
  );

  const formTitle = values?.title ? `${id} - ${values.title}` : "Loading...";
  const formStatus = updateMutation.isPending
    ? "Saving..."
    : isDirty
      ? "Not Saved"
      : "Saved";

  if (isLoading || !values) {
    return (
      <div className="p-10 flex items-center justify-center">Loading...</div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 flex items-center justify-center text-red-500">
        Failed to load material.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main form area */}
        <div className="flex-1 min-w-0">
          <FrappeForm
            title={formTitle}
            status={formStatus}
            fields={formFields}
            menuOptions={detailMenuOptions}
            values={values}
            errors={errors}
            onChange={handleChange}
            onSave={handleSave}
            isSaving={updateMutation.isPending}
            headerActions={headerActions}
            topContent={null} // no extra top content
          />
        </div>

        {/* Simple sidebar */}
        <div className="lg:w-64">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailMain;