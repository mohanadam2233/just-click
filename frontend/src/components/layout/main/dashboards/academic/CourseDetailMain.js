"use client";

import FrappeChildTable from "@/components/shared/forms/FrappeChildTable";
import FrappeForm from "@/components/shared/forms/FrappeForm";
import {
  useCourseDetail,
  useDepartmentsDropdown,
  useSemestersDropdown,
} from "@/features/academic/hooks";
import { useDeleteCourse, useUpdateCourse } from "@/features/course/hooks";
import useNotify from "@/hooks/useNotify";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRACKED_FIELDS = ["title", "code", "description", "offerings"];

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const chapterSchema = z.object({
  idx: z.number().optional(),
  id: z.any().optional(),
  __id: z.string().optional(),
  number: z.number().optional(),
  title: z.string().min(1, "Chapter title is required"),
  description: z.string().optional(),
  is_enabled: z.boolean().optional(),
});

const offeringSchema = z.object({
  idx: z.number().optional(),
  id: z.any().optional(),
  __id: z.string().optional(),

  department_id: z.string().min(1, "Please select a Department"),
  semester_id: z.string().min(1, "Please select a Semester"),

  department_name: z.string().optional(),
  semester_name: z.string().optional(),
  semester_code: z.string().optional(),

  custom_title: z.string().optional(),
  credit_hours: z.any().optional(),
  is_enabled: z.boolean().optional(),

  chapters: z.array(chapterSchema).optional(),
  chapters_count: z.number().optional(),
});

const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  code: z.string().min(1, "Code is required").max(20, "Code is too long"),
  description: z.string().optional(),
  offerings: z.array(offeringSchema).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractDetailRecord(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? null;
}

function extractDropdownRows(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
}

function makeRowId(prefix, id, index) {
  return `${prefix}-${id ?? `new-${index}`}`;
}

function getChaptersCount(chapters = []) {
  return Array.isArray(chapters) ? chapters.length : 0;
}

function normalizeChapters(chapters = []) {
  return (Array.isArray(chapters) ? chapters : []).map((chapter, index) => ({
    __id: chapter?.__id || makeRowId("chapter", chapter?.id, index),
    idx: index + 1,
    id: chapter?.id ?? null,
    number: chapter?.number ? Number(chapter.number) : index + 1,
    title: chapter?.title || "",
    description: chapter?.description || "",
    is_enabled:
      chapter?.is_enabled === undefined ? true : Boolean(chapter?.is_enabled),
  }));
}

function normalizeCourseToForm(item) {
  return {
    title: item?.title || "",
    code: item?.code || "",
    description: item?.description || "",
    offerings: (item?.offerings || []).map((offering, offeringIndex) => {
      const chapters = normalizeChapters(offering?.chapters || []);

      return {
        __id: makeRowId("offering", offering?.id, offeringIndex),
        idx: offeringIndex + 1,
        id: offering?.id ?? null,

        department_id: offering?.department_id
          ? String(offering.department_id)
          : "",
        department_name: offering?.department_name || "",

        semester_id: offering?.semester_id ? String(offering.semester_id) : "",
        semester_name: offering?.semester_name || "",
        semester_code: offering?.semester_code || "",

        custom_title: offering?.custom_title || "",
        credit_hours:
          offering?.credit_hours !== undefined &&
          offering?.credit_hours !== null
            ? String(offering.credit_hours)
            : "",

        is_enabled:
          offering?.is_enabled === undefined
            ? true
            : Boolean(offering.is_enabled),

        chapters,
        chapters_count: getChaptersCount(chapters),
      };
    }),
  };
}

function normalizeForCompare(value) {
  return JSON.stringify(value ?? null);
}

function getChangedFields(initialValues, currentValues) {
  const changed = {};

  TRACKED_FIELDS.forEach((key) => {
    if (
      normalizeForCompare(initialValues?.[key]) !==
      normalizeForCompare(currentValues?.[key])
    ) {
      changed[key] = currentValues[key];
    }
  });

  return changed;
}

function mapDepartmentOptions(items = []) {
  return items
    .filter(Boolean)
    .map((item) => ({
      label:
        item?.label ||
        item?.name ||
        item?.title ||
        `Department #${item?.value ?? item?.id}`,
      value: String(item?.value ?? item?.id ?? ""),
      meta: item?.meta || { code: item?.code || "" },
    }))
    .filter((item) => item.value);
}

function mapSemesterOptions(items = []) {
  return items
    .filter(Boolean)
    .map((item) => ({
      label:
        item?.label ||
        item?.display_name ||
        item?.name ||
        (item?.number
          ? `Semester ${item.number}`
          : `Semester #${item?.value ?? item?.id}`),
      value: String(item?.value ?? item?.id ?? ""),
      meta: item?.meta || {
        code: item?.code || item?.display_name || item?.name || "",
      },
    }))
    .filter((item) => item.value);
}

function mergeCurrentDepartmentOptions(baseOptions = [], offerings = []) {
  const map = new Map();

  baseOptions.forEach((option) => {
    map.set(String(option.value), option);
  });

  offerings.forEach((offering) => {
    if (!offering?.department_id) return;

    const value = String(offering.department_id);

    if (!map.has(value)) {
      map.set(value, {
        label: offering.department_name || `Department #${value}`,
        value,
        meta: { code: "" },
      });
    }
  });

  return Array.from(map.values());
}

function mergeCurrentSemesterOptions(baseOptions = [], offerings = []) {
  const map = new Map();

  baseOptions.forEach((option) => {
    map.set(String(option.value), option);
  });

  offerings.forEach((offering) => {
    if (!offering?.semester_id) return;

    const value = String(offering.semester_id);

    if (!map.has(value)) {
      map.set(value, {
        label: offering.semester_name || `Semester #${value}`,
        value,
        meta: { code: offering.semester_code || "" },
      });
    }
  });

  return Array.from(map.values());
}

function cleanOfferingsForState(offerings = []) {
  return (Array.isArray(offerings) ? offerings : []).map((offering, index) => {
    const chapters = normalizeChapters(offering?.chapters || []);

    return {
      ...offering,
      __id: offering?.__id || makeRowId("offering", offering?.id, index),
      idx: index + 1,
      id: offering?.id ?? null,

      department_id: offering?.department_id
        ? String(offering.department_id)
        : "",
      department_name: offering?.department_name || "",

      semester_id: offering?.semester_id ? String(offering.semester_id) : "",
      semester_name: offering?.semester_name || "",
      semester_code: offering?.semester_code || "",

      custom_title: offering?.custom_title || "",
      credit_hours:
        offering?.credit_hours !== undefined && offering?.credit_hours !== null
          ? String(offering.credit_hours)
          : "",

      is_enabled:
        offering?.is_enabled === undefined
          ? true
          : Boolean(offering.is_enabled),

      chapters,
      chapters_count: getChaptersCount(chapters),
    };
  });
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildUpdatePayload(changedFields) {
  const payload = { ...changedFields };

  if (changedFields.offerings !== undefined) {
    payload.offerings = cleanOfferingsForState(changedFields.offerings).map(
      (offering) => ({
        ...(offering.id ? { id: Number(offering.id) } : {}),

        department_id: Number(offering.department_id),
        semester_id: Number(offering.semester_id),
        custom_title: offering.custom_title?.trim() || null,
        credit_hours: toNullableNumber(offering.credit_hours),
        is_enabled:
          offering.is_enabled === undefined
            ? true
            : Boolean(offering.is_enabled),

        chapters: normalizeChapters(offering.chapters || []).map(
          (chapter, chapterIndex) => ({
            ...(chapter.id ? { id: Number(chapter.id) } : {}),

            number: chapter?.number ? Number(chapter.number) : chapterIndex + 1,
            title: chapter.title?.trim() || "",
            description: chapter.description?.trim() || "",
            is_enabled:
              chapter.is_enabled === undefined
                ? true
                : Boolean(chapter.is_enabled),
          }),
        ),
      }),
    );
  }

  return payload;
}

// ---------------------------------------------------------------------------
// Chapter columns
// ---------------------------------------------------------------------------

const CHAPTER_COLUMNS = [
  {
    key: "idx",
    label: "#",
    width: "w-10",
    readOnly: true,
    render: (_, __, rowIndex) => rowIndex + 1,
  },
  {
    key: "title",
    label: "Title",
    type: "text",
    required: true,
    editableInTable: true,
    editableInModal: true,
    placeholder: "e.g., Python Basics",
  },
  {
    key: "description",
    label: "Description",
    type: "text",
    editableInTable: true,
    editableInModal: true,
    placeholder: "Short description (optional)",
  },
  {
    key: "is_enabled",
    label: "Active",
    width: "w-20",
    type: "checkbox",
    checkboxLabel: "Enabled",
    editableInTable: true,
    editableInModal: true,
    render: (value) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
          value
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-500"
        }`}
      >
        {value ? "Active" : "Inactive"}
      </span>
    ),
  },
];

// ---------------------------------------------------------------------------
// ChapterManagerModal
// ---------------------------------------------------------------------------

function ChapterManagerModal({ open, offering, chapters, onClose, onSave }) {
  const [localChapters, setLocalChapters] = useState([]);

  useEffect(() => {
    if (!open) return;
    setLocalChapters(normalizeChapters(chapters || []));
  }, [open, chapters]);

  if (!open) return null;

  const handleSave = () => {
    const cleaned = normalizeChapters(localChapters);
    const hasEmptyTitle = cleaned.some((ch) => !ch.title?.trim());

    if (hasEmptyTitle) {
      alert("Every chapter must have a title.");
      return;
    }

    onSave(cleaned);
  };

  const offeringLabel =
    offering?.custom_title ||
    [offering?.department_name, offering?.semester_name]
      .filter(Boolean)
      .join(" · ") ||
    "Offering";

  const count = localChapters.length;

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={[
            "pointer-events-auto w-full bg-white dark:bg-slate-900",
            "border border-gray-200 dark:border-slate-700",
            "rounded-xl shadow-lg",
            "flex flex-col",
            "max-w-3xl",
            "max-h-[85vh]",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  Manage Chapters
                </h2>

                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                  {count === 1 ? "1 chapter" : `${count} chapters`}
                </span>
              </div>

              <p className="mt-0.5 text-[12px] text-gray-500 dark:text-gray-400 truncate">
                {offeringLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            <FrappeChildTable
              value={localChapters}
              onChange={(next) => setLocalChapters(normalizeChapters(next))}
              columns={CHAPTER_COLUMNS}
              editable
              allowAddRow
              allowDeleteSelected
              allowRowSelection
              showRowSelection
              showAddRowButton
              showDeleteSelectedButton
              showMoreAction={false}
              useModal={false}
              showFooter
              addRowLabel="Add Chapter"
              emptyMessage="No chapters yet. Click 'Add Chapter' to get started."
              newRowDefaults={{
                id: null,
                title: "",
                description: "",
                is_enabled: true,
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 dark:border-slate-800 flex-shrink-0 bg-gray-50/60 dark:bg-slate-900 rounded-b-xl">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Changes apply when you click{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Apply
              </span>
              . They are saved with the course form.
            </p>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-md text-[13px] font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-3.5 py-1.5 rounded-md text-[13px] font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// CourseDetailMain
// ---------------------------------------------------------------------------

const CourseDetailMain = ({ id }) => {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [semesterSearch, setSemesterSearch] = useState("");

  const [chapterModal, setChapterModal] = useState({
    open: false,
    offeringIndex: null,
  });

  const hasInitializedRef = useRef(false);

  const { data: response, isLoading, isError } = useCourseDetail(id);
  const courseData = useMemo(() => extractDetailRecord(response), [response]);

  const {
    data: departmentsResponse,
    isLoading: isLoadingDepts,
    isFetching: isFetchingDepts,
  } = useDepartmentsDropdown(
    {
      limit: 20,
      offset: 0,
      active_only: true,
      search: departmentSearch || undefined,
    },
    {
      staleTime: 60_000,
      placeholderData: (previousData) => previousData,
    },
  );

  const {
    data: semestersResponse,
    isLoading: isLoadingSems,
    isFetching: isFetchingSems,
  } = useSemestersDropdown(
    {
      limit: 20,
      offset: 0,
      active_only: true,
      search: semesterSearch || undefined,
    },
    {
      staleTime: 60_000,
      placeholderData: (previousData) => previousData,
    },
  );

  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const departmentRows = useMemo(() => {
    const rows = extractDropdownRows(departmentsResponse);
    return Array.isArray(rows) ? rows : [];
  }, [departmentsResponse]);

  const semesterRows = useMemo(() => {
    const rows = extractDropdownRows(semestersResponse);
    return Array.isArray(rows) ? rows : [];
  }, [semestersResponse]);

  const baseDepartmentOptions = useMemo(
    () => mapDepartmentOptions(departmentRows),
    [departmentRows],
  );

  const baseSemesterOptions = useMemo(
    () => mapSemesterOptions(semesterRows),
    [semesterRows],
  );

  const departmentOptions = useMemo(
    () =>
      mergeCurrentDepartmentOptions(
        baseDepartmentOptions,
        values?.offerings || [],
      ),
    [baseDepartmentOptions, values?.offerings],
  );

  const semesterOptions = useMemo(
    () =>
      mergeCurrentSemesterOptions(baseSemesterOptions, values?.offerings || []),
    [baseSemesterOptions, values?.offerings],
  );

  useEffect(() => {
    if (!courseData) return;

    const normalized = normalizeCourseToForm(courseData);

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
  }, [courseData, initialValues]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const isDirty = Object.keys(changedFields).length > 0;

  const activeOffering =
    chapterModal.open && chapterModal.offeringIndex !== null
      ? values?.offerings?.[chapterModal.offeringIndex]
      : null;

  const handleChange = (field, value) => {
    let nextValue = value;

    if (field === "offerings") {
      nextValue = cleanOfferingsForState(value || []);
    }

    setValues((prev) => ({
      ...prev,
      [field]: nextValue,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const openChapterModal = (offeringIndex) => {
    setChapterModal({
      open: true,
      offeringIndex,
    });
  };

  const closeChapterModal = () => {
    setChapterModal({
      open: false,
      offeringIndex: null,
    });
  };

  const applyChaptersToOffering = (chapters) => {
    if (chapterModal.offeringIndex === null) return;

    setValues((prev) => {
      const offerings = [...(prev?.offerings || [])];

      offerings[chapterModal.offeringIndex] = {
        ...offerings[chapterModal.offeringIndex],
        chapters: normalizeChapters(chapters),
        chapters_count: getChaptersCount(chapters),
      };

      return {
        ...prev,
        offerings: cleanOfferingsForState(offerings),
      };
    });

    setErrors((prev) => ({
      ...prev,
      offerings: null,
    }));

    closeChapterModal();
  };

  const handleSave = (e) => {
    e?.preventDefault?.();

    if (!values) return;

    setErrors({});

    const cleanedValues = {
      ...values,
      offerings: cleanOfferingsForState(values.offerings || []),
    };

    const result = courseSchema.safeParse(cleanedValues);

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

    const payload = buildUpdatePayload(changedFields);

    updateMutation.mutate(
      {
        id,
        payload,
      },
      {
        onSuccess: () => {
          notify.success("Course updated successfully");

          const nextValues = {
            ...values,
            ...changedFields,
            ...(changedFields.offerings !== undefined
              ? {
                  offerings: cleanOfferingsForState(changedFields.offerings),
                }
              : {}),
          };

          setValues(nextValues);
          setInitialValues(nextValues);

          // Stay on this same detail page.
        },
        onError: (err) => {
          notify.error(err?.message || "Failed to update course");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    deleteMutation.mutate(
      {
        id,
        permanent: false,
      },
      {
        onSuccess: () => {
          notify.success("Document deleted");
          router.push("/admin/dashboards/admin-academic/courses");
        },
        onError: (err) => {
          notify.error(err?.message || "Failed to delete course");
        },
      },
    );
  };

  const formFields = useMemo(
    () => [
      {
        name: "title",
        label: "Course Title",
        type: "text",
        required: true,
        layout: "full",
        placeholder: "e.g., Advanced Database Systems",
      },
      {
        name: "code",
        label: "Code",
        type: "text",
        required: true,
        layout: "half",
        placeholder: "e.g., CS4012",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        layout: "full",
        placeholder: "Advanced concepts in database design and optimization.",
      },
      {
        name: "offerings",
        label: "Offerings",
        type: "child-table",
        layout: "full",
        childTableProps: {
          editable: true,
          allowAddRow: true,
          allowDeleteSelected: true,
          allowRowSelection: true,
          showMoreAction: false,
          useModal: false,
          addRowLabel: "Add Offering",
          emptyMessage: "No offerings found.",
          titleField: "custom_title",

          newRowDefaults: {
            id: null,
            department_id: "",
            department_name: "",
            semester_id: "",
            semester_name: "",
            semester_code: "",
            custom_title: "",
            credit_hours: "",
            is_enabled: true,
            chapters: [],
            chapters_count: 0,
          },

          columns: [
            {
              key: "idx",
              label: "No.",
              width: "w-12",
              render: (_, __, rowIndex) => rowIndex + 1,
              readOnly: true,
            },
            {
              key: "department_id",
              label: "Department",
              width: "min-w-[200px]",
              type: "async-dropdown",
              required: true,
              placeholder: "Search department",
              editableInTable: true,
              editableInModal: true,
              dropdownProps: {
                options: departmentOptions,
                isLoading: isLoadingDepts || isFetchingDepts,
                hasMore: false,
                setSearch: setDepartmentSearch,
                getSublabel: (opt) =>
                  opt?.meta?.code ? `Code: ${opt.meta.code}` : "",
              },
            },
            {
              key: "semester_id",
              label: "Semester",
              width: "min-w-[160px]",
              type: "async-dropdown",
              required: true,
              placeholder: "Search semester",
              editableInTable: true,
              editableInModal: true,
              dropdownProps: {
                options: semesterOptions,
                isLoading: isLoadingSems || isFetchingSems,
                hasMore: false,
                setSearch: setSemesterSearch,
                getSublabel: (opt) => opt?.meta?.code || "",
              },
            },
            {
              key: "custom_title",
              label: "Custom Title",
              width: "min-w-[220px]",
              type: "text",
              placeholder: "Optional title",
              editableInTable: true,
              editableInModal: true,
            },
            {
              key: "credit_hours",
              label: "Credits",
              width: "w-28",
              type: "number",
              placeholder: "3",
              editableInTable: true,
              editableInModal: true,
            },
            {
              key: "chapters_count",
              label: "Chapters",
              width: "w-32",
              readOnly: true,
              editableInTable: false,
              editableInModal: false,
              render: (_, row, rowIndex) => {
                const count = getChaptersCount(row?.chapters || []);

                return (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openChapterModal(rowIndex);
                    }}
                    className={[
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium",
                      "border transition-colors",
                      count > 0
                        ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700",
                    ].join(" ")}
                  >
                    {count === 0
                      ? "No chapters"
                      : count === 1
                        ? "1 chapter"
                        : `${count} chapters`}
                  </button>
                );
              },
            },
            {
              key: "is_enabled",
              label: "Active",
              width: "w-24",
              type: "checkbox",
              checkboxLabel: "Enabled",
              render: (value) => (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                    value
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-500"
                  }`}
                >
                  {value ? "Active" : "Inactive"}
                </span>
              ),
              editableInTable: true,
              editableInModal: true,
            },
          ],
        },
      },
    ],
    [
      departmentOptions,
      semesterOptions,
      isLoadingDepts,
      isFetchingDepts,
      isLoadingSems,
      isFetchingSems,
    ],
  );

  const menuOptions = useMemo(
    () => [
      {
        label: deleteMutation.isPending ? "Deleting..." : "Delete",
        action: handleDelete,
        disabled: deleteMutation.isPending,
      },
    ],
    [deleteMutation.isPending],
  );

  const formTitle = values?.title
    ? `${id} - ${values.title}`
    : courseData?.title
      ? `${id} - ${courseData.title}`
      : "Loading...";

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
        Failed to load course.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title={formTitle}
        status={formStatus}
        fields={formFields}
        values={values}
        errors={errors}
        onChange={handleChange}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        menuOptions={menuOptions}
      />

      <ChapterManagerModal
        open={chapterModal.open}
        offering={activeOffering}
        chapters={activeOffering?.chapters || []}
        onClose={closeChapterModal}
        onSave={applyChaptersToOffering}
      />
    </div>
  );
};

export default CourseDetailMain;
