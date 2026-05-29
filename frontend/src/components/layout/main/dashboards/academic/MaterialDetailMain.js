"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import Preloader from "@/components/shared/others/Preloader";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

// ------------------------------
// Constants & helpers
// ------------------------------
const TRACKED_FIELDS = [
  "course_offering_id",
  "chapter_id",
  "title",
  "material_type",
  "file",
  "file_size_mb",
  "slide_count",
  "learning_objectives",
  "description",
  "semester",
  "academic_year",
  "department",
  "is_downloadable",
  "is_enabled",
];

const MATERIAL_TYPE_OPTIONS = [
  { label: "PDF", value: "pdf" },
  { label: "Slides", value: "slides" },
  { label: "Video", value: "video" },
  { label: "Other", value: "other" },
];

const materialSchema = z
  .object({
    course_offering_id: z.number().min(1, "Please select a course offering"),
    chapter_id: z.number().optional().nullable(),
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    material_type: z.string().min(1, "Material type is required"),
    file: z.any().optional(),
    file_size_mb: z.number().optional().nullable(),
    slide_count: z.number().optional().nullable(),
    learning_objectives: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
    semester: z.string().optional(),
    academic_year: z.string().optional(),
    department: z.string().optional(),
    is_downloadable: z.boolean().default(true),
    is_enabled: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (
      data.material_type === "slides" &&
      (!data.slide_count || data.slide_count <= 0)
    ) {
      ctx.addIssue({
        path: ["slide_count"],
        message: "Slide count must be greater than 0 for slides",
        code: z.ZodIssueCode.custom,
      });
    }
  });

function normalizeDropdownValue(value) {
  if (value == null) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    if (value.value != null) return String(value.value);
    if (value.id != null) return String(value.id);
  }

  return "";
}

function extractDetailRecord(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? null;
}

function extractDropdownRows(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
}

function normalizeMaterialToForm(material) {
  if (!material) return null;

  return {
    course_offering_id: material.course_offering?.id || "",
    chapter_id: material.chapter?.id || "",
    title: material.title || "",
    material_type: material.material_type || "",
    file: null,
    file_size_mb: material.file?.size_mb ?? "",
    slide_count: material.file?.slide_count ?? "",
    learning_objectives: Array.isArray(material.learning_objectives)
      ? material.learning_objectives
      : [],
    description: material.description || "",
    semester: material.semester?.name || material.semester || "",
    academic_year: material.academic_year?.name || material.academic_year || "",
    department: material.department?.name || material.department || "",
    is_downloadable: material.flags?.is_downloadable ?? true,
    is_enabled: material.flags?.is_enabled ?? true,
  };
}

function getComparableValue(key, value) {
  if (key === "file") {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.name || "";
  }

  if (key === "learning_objectives") {
    return Array.isArray(value)
      ? value.map((item) => String(item).trim()).filter(Boolean)
      : [];
  }

  if (key === "chapter_id") {
    return value || "";
  }

  return value;
}

function getChangedFields(initial, current) {
  const changed = {};

  TRACKED_FIELDS.forEach((key) => {
    const oldVal = getComparableValue(key, initial?.[key]);
    const newVal = getComparableValue(key, current?.[key]);

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changed[key] = current[key];
    }
  });

  return changed;
}

function buildMaterialPayload(values) {
  return {
    course_offering_id: Number(values.course_offering_id),
    chapter_id: values.chapter_id ? Number(values.chapter_id) : null,
    title: values.title,
    material_type: values.material_type,
    slide_count:
      values.material_type === "slides"
        ? values.slide_count
          ? Number(values.slide_count)
          : null
        : null,
    file_size_mb: values.file_size_mb ? Number(values.file_size_mb) : null,
    learning_objectives: Array.isArray(values.learning_objectives)
      ? values.learning_objectives
      : [],
    description: values.description || "",
    semester: values.semester || "",
    academic_year: values.academic_year || "",
    department: values.department || "",
    is_downloadable: !!values.is_downloadable,
    is_enabled: !!values.is_enabled,
  };
}

function mapCourseOptions(items = []) {
  return items.map((item) => ({
    label: item?.custom_title || item?.title || `Course #${item.id}`,
    value: String(item.id),
    meta: { code: item?.course?.code || "" },
  }));
}

function mapChapterOptions(items = []) {
  return items.map((item) => ({
    label: item?.title || `Chapter #${item.id}`,
    value: String(item.id),
  }));
}

function getFileIcon(materialType) {
  if (materialType === "slides") return "icofont-file-powerpoint";
  if (materialType === "pdf") return "icofont-file-pdf";
  if (materialType === "video") return "icofont-video-cam";
  return "icofont-file";
}

function formatFileSize(sizeMb) {
  if (!sizeMb && sizeMb !== 0) return "—";
  return `${sizeMb} MB`;
}

function getPagesOrSlidesLabel(material) {
  if (material?.material_type === "slides") {
    const slides = material.file?.slide_count;
    return slides ? `${slides} slides` : "—";
  }

  if (material?.material_type === "pdf") {
    const pages = material.file?.page_count;
    return pages ? `${pages} pages` : "—";
  }

  return "—";
}

// ------------------------------
// File Summary Card Component
// ------------------------------
const FileSummaryCard = ({ material }) => {
  const file = material?.file || {};
  const stats = material?.stats || { view_count: 0, download_count: 0 };
  const materialType = material?.material_type;

  const items = [
    ["Type", file?.extension?.toUpperCase() || "—"],
    ["Size", formatFileSize(file?.size_mb)],
    ["Length", getPagesOrSlidesLabel(material)],
    ["Views", stats.view_count || 0],
    ["Downloads", stats.download_count || 0],
  ];

  const iconClass = getFileIcon(materialType);

  return (
    <div className="bg-lightGrey11 dark:bg-gray-800 p-6 rounded-2xl border border-secondaryColor/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-secondaryColor rounded-xl flex items-center justify-center text-white text-2xl">
          <i className={iconClass}></i>
        </div>

        <div>
          <h4 className="font-bold text-blackColor dark:text-white">
            File Summary
          </h4>
          <p className="text-xs text-secondaryColor font-bold uppercase">
            {materialType === "slides"
              ? "Presentation"
              : materialType || "Material"}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-paragraphColor dark:text-gray-400">
              {label}
            </span>
            <span className="font-bold text-blackColor dark:text-white uppercase">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------
// Main Component
// ------------------------------
const MaterialDetailMain = ({ id }) => {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});
  const hasInitialized = useRef(false);

  const { data: detailRes, isLoading, isError } = useMaterialDetail(id);
  const material = useMemo(() => extractDetailRecord(detailRes), [detailRes]);

  const { data: coursesRes, isLoading: isLoadingCourses } = useCoursesDropdown(
    { limit: 20, active_only: true },
    { staleTime: 60_000 },
  );

  const courseRows = useMemo(
    () => extractDropdownRows(coursesRes),
    [coursesRes],
  );

  const coursesOptions = useMemo(
    () => mapCourseOptions(courseRows),
    [courseRows],
  );

  const normalizedCourseId = normalizeDropdownValue(values?.course_offering_id);

  const { data: chaptersRes, isLoading: isLoadingChapters } =
    useChaptersDropdown(
      { course_offering_id: normalizedCourseId, limit: 20, active_only: true },
      { enabled: !!normalizedCourseId, staleTime: 60_000 },
    );

  const chapterRows = useMemo(
    () => extractDropdownRows(chaptersRes),
    [chaptersRes],
  );

  const chapterOptions = useMemo(
    () => mapChapterOptions(chapterRows),
    [chapterRows],
  );

  useEffect(() => {
    if (!material) return;

    const normalized = normalizeMaterialToForm(material);

    if (!hasInitialized.current) {
      setValues(normalized);
      setInitialValues(normalized);
      hasInitialized.current = true;
    } else if (!initialValues) {
      setValues(normalized);
      setInitialValues(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material]);

  const isDirty = useMemo(() => {
    if (!values || !initialValues) return false;
    return Object.keys(getChangedFields(initialValues, values)).length > 0;
  }, [initialValues, values]);

  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  const fileInfo = material?.file || {};
  const flags = material?.flags || {};

  const handleOpenRead = useCallback(() => {
    const readUrl = fileInfo?.read_url || fileInfo?.url;

    if (!readUrl) {
      notify.warning("No file available to read");
      return;
    }

    window.open(readUrl, "_blank", "noopener,noreferrer");
  }, [fileInfo?.read_url, fileInfo?.url, notify]);

  const handleOpenDownload = useCallback(() => {
    if (!fileInfo?.url) {
      notify.warning("No file available to download");
      return;
    }

    window.open(fileInfo.url, "_blank", "noopener,noreferrer");
  }, [fileInfo?.url, notify]);

  const handleDelete = useCallback(() => {
    if (confirm("Permanently delete this material?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          notify.success("Material deleted");
          router.push("/admin/dashboards/admin-academic/materials");
        },
        onError: (err) => notify.error(err?.message || "Delete failed"),
      });
    }
  }, [deleteMutation, id, notify, router]);

  const handleChange = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "course_offering_id") {
        next.chapter_id = "";
      }

      if (field === "material_type" && value !== "slides") {
        next.slide_count = "";
      }

      if (field === "file" && value?.size) {
        next.file_size_mb = Number((value.size / (1024 * 1024)).toFixed(2));
      }

      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = (e) => {
    e?.preventDefault();

    if (!values) return;

    setErrors({});

    const testData = {
      ...values,
      course_offering_id: Number(values.course_offering_id),
      chapter_id: values.chapter_id ? Number(values.chapter_id) : null,
      material_type: values.material_type,
      file_size_mb: values.file_size_mb ? Number(values.file_size_mb) : null,
      slide_count: values.slide_count ? Number(values.slide_count) : null,
    };

    const result = materialSchema.safeParse(testData);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key) fieldErrors[key] = issue.message;
      });

      setErrors(fieldErrors);
      notify.error("Please fix the highlighted fields");
      return;
    }

    if (!isDirty) {
      notify.warning("No changes detected");
      return;
    }

    const changed = getChangedFields(initialValues, values);
    const payload = buildMaterialPayload(values);
    const updatePayload = {};

    Object.keys(changed).forEach((key) => {
      if (key === "file") return;
      updatePayload[key] = payload[key];
    });

    const fileToUpload = changed.file ? values.file : undefined;

    updateMutation.mutate(
      { id, payload: updatePayload, file: fileToUpload },
      {
        onSuccess: () => {
          notify.success("Material updated");

          const nextValues = {
            ...values,
            file: null,
          };

          setValues(nextValues);
          setInitialValues(nextValues);
        },
        onError: (error) => {
          const msg =
            error?.response?.data?.message || error?.message || "Update failed";

          notify.error(msg);
        },
      },
    );
  };

  const headerActions = (
    <>
      <button
        type="button"
        onClick={handleOpenRead}
        disabled={!(fileInfo?.read_url || fileInfo?.url)}
        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        Read
      </button>

      <button
        type="button"
        onClick={handleOpenDownload}
        disabled={
          !fileInfo?.url || !(flags?.is_downloadable ?? values?.is_downloadable)
        }
        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download
      </button>

      <button
        type="button"
        onClick={() =>
          router.push("/admin/dashboards/admin-academic/materials")
        }
        className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back
      </button>
    </>
  );

  const detailMenuOptions = useMemo(
    () => [
      { label: "Print", action: () => window.print() },
      { label: "Delete", action: handleDelete },
    ],
    [handleDelete],
  );

  const currentFileName = fileInfo?.url?.split("/").pop() || "";

  const fileMetaText = [
    fileInfo?.extension?.toUpperCase(),
    fileInfo?.size_mb ? `${fileInfo.size_mb} MB` : null,
    fileInfo?.slide_count ? `${fileInfo.slide_count} slides` : null,
    fileInfo?.page_count ? `${fileInfo.page_count} pages` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const formFields = [
    {
      section: "Basic Information",
      fields: [
        {
          name: "title",
          label: "Title",
          type: "text",
          required: true,
          layout: "full",
          placeholder: "e.g., Database Architecture Slides",
        },
        {
          name: "course_offering_id",
          label: "Course Offering",
          type: "async-dropdown",
          required: true,
          layout: "stacked",
          placeholder: "Select course offering",
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
          layout: "stacked",
          placeholder: normalizedCourseId
            ? "Select chapter"
            : "Select course offering first",
          dropdownProps: {
            options: chapterOptions,
            isLoading: isLoadingChapters,
            hasMore: false,
          },
        },
      ],
    },
    {
      section: "Academic Details",
      fields: [
        {
          name: "semester",
          label: "Semester",
          type: "text",
          layout: "half",
          placeholder: "e.g., Semester 1",
        },

        {
          name: "department",
          label: "Department",
          type: "text",
          layout: "half",
          placeholder: "e.g., Computer Science",
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
          placeholder: "Select type",
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
          placeholder: "Auto-filled on upload",
        },
        {
          name: "slide_count",
          label: "Slide Count",
          type: "number",
          layout: "third",
          placeholder: "e.g., 45",
          condition: (vals) => vals.material_type === "slides",
        },
        {
          name: "file",
          label: "File",
          type: "file",
          layout: "full",
          fileProps: {
            buttonLabel: "Replace File",
            helperText:
              "Upload a new version. File size and slide count will update automatically.",
            currentFileName: currentFileName,
            readUrl: fileInfo?.read_url || fileInfo?.url || "",
            downloadUrl: fileInfo?.url || "",
            metaText: fileMetaText,
          },
        },
        {
          name: "learning_objectives",
          label: "Learning Objectives",
          type: "tags",
          layout: "full",
          placeholder: "Type objective and press Enter",
          description: "Press Enter or comma to add each learning objective.",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          layout: "full",
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
          checkboxDescription: "Students can download this file.",
        },
        {
          name: "is_enabled",
          label: "Visibility",
          type: "checkbox",
          layout: "half",
          checkboxLabel: "Enabled",
          checkboxDescription: "Material is visible to students.",
        },
      ],
    },
  ];

  if (isLoading || !values) return <Preloader />;

  if (isError) {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load material.
      </div>
    );
  }

  const formTitle = `${id} - ${values?.title || "Material"}`;

  const formStatus = updateMutation.isPending
    ? "Saving..."
    : isDirty
      ? "Not Saved"
      : "Saved";

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
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
          />
        </div>

        <div className="lg:w-80 flex-shrink-0">
          <FileSummaryCard material={material} />
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailMain;
