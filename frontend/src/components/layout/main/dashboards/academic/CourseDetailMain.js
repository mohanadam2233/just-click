"use client";

import Preloader from "@/components/shared/others/Preloader";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import {
  useCourseDetail,
  useDeleteCourse,
  useDepartmentsDropdown,
  useSemestersDropdown,
  useUpdateCourse,
} from "@/features/academic/hooks";
import useNotify from "@/hooks/useNotify";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

const TRACKED_FIELDS = [
  "department_id",
  "semester_id",
  "title",
  "code",
  "description",
  "chapters",
];

const chapterSchema = z.object({
  idx: z.number().optional(),
  id: z.any().optional(),
  __id: z.string().optional(),
  title: z.string().min(1, "Chapter title is required"),
  is_enabled: z.boolean().optional(),
});

const courseSchema = z.object({
  department_id: z.string().min(1, "Please select a Department"),
  semester_id: z.string().min(1, "Please select a Semester"),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  code: z.string().min(1, "Code is required").max(20, "Code is too long"),
  description: z.string().optional(),
  chapters: z.array(chapterSchema).optional(),
});

function extractDetailRecord(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? null;
}

function extractDropdownRows(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
}

function normalizeCourseToForm(item) {
  return {
    department_id: item?.department?.id
      ? String(item.department.id)
      : item?.department_id
        ? String(item.department_id)
        : "",
    semester_id: item?.semester?.id
      ? String(item.semester.id)
      : item?.semester_id
        ? String(item.semester_id)
        : "",
    title: item?.title || "",
    code: item?.code || "",
    description: item?.description || "",
    chapters: (item?.chapters || []).map((chapter, index) => ({
      __id: `chapter-${chapter.id ?? index}`,
      idx: chapter.number || index + 1,
      id: chapter.id ?? null,
      title: chapter.title || "",
      is_enabled: Boolean(chapter.is_enabled),
    })),
  };
}

function getChangedFields(initialValues, currentValues) {
  const changed = {};

  TRACKED_FIELDS.forEach((key) => {
    if (
      JSON.stringify(initialValues?.[key]) !==
      JSON.stringify(currentValues?.[key])
    ) {
      changed[key] = currentValues[key];
    }
  });

  return changed;
}

function mapDepartmentOptions(items = []) {
  return items.map((item) => ({
    label:
      item?.label ||
      item?.name ||
      item?.title ||
      `Department #${item?.value ?? item?.id}`,
    value: String(item?.value ?? item?.id ?? ""),
    meta: item?.meta || {
      code: item?.code || "",
    },
  }));
}

function mapSemesterOptions(items = []) {
  return items.map((item) => ({
    label:
      item?.label ||
      item?.display_name ||
      item?.name ||
      (item?.number ? `Semester ${item.number}` : `Semester #${item?.value ?? item?.id}`),
    value: String(item?.value ?? item?.id ?? ""),
    meta: item?.meta || {
      code: item?.code || item?.display_name || item?.name || "",
    },
  }));
}

const CourseDetailMain = ({ id }) => {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const hasInitializedRef = useRef(false);

  const { data: response, isLoading, isError } = useCourseDetail(id);
  const courseData = useMemo(() => extractDetailRecord(response), [response]);

  const { data: departmentsResponse, isLoading: isLoadingDepts } =
    useDepartmentsDropdown({
      limit: 20,
      offset: 0,
      active_only: true,
    });

  const { data: semestersResponse, isLoading: isLoadingSems } =
    useSemestersDropdown({
      limit: 20,
      offset: 0,
      active_only: true,
    });

  const departmentRows = useMemo(() => {
    const rows = extractDropdownRows(departmentsResponse);
    return Array.isArray(rows) ? rows : [];
  }, [departmentsResponse]);

  const semesterRows = useMemo(() => {
    const rows = extractDropdownRows(semestersResponse);
    return Array.isArray(rows) ? rows : [];
  }, [semestersResponse]);

  const departmentOptions = useMemo(() => {
    return mapDepartmentOptions(departmentRows);
  }, [departmentRows]);

  const semesterOptions = useMemo(() => {
    return mapSemesterOptions(semesterRows);
  }, [semesterRows]);

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

  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const handleChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    if (!values) return;

    setErrors({});
    const result = courseSchema.safeParse(values);

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

    const payload = {
      ...changedFields,
      ...(changedFields.department_id !== undefined
        ? { department_id: Number(changedFields.department_id) }
        : {}),
      ...(changedFields.semester_id !== undefined
        ? { semester_id: Number(changedFields.semester_id) }
        : {}),
      ...(changedFields.chapters !== undefined
        ? {
            chapters: changedFields.chapters.map((chapter, index) => ({
              id: chapter.id || null,
              number: index + 1,
              title: chapter.title,
              is_enabled: Boolean(chapter.is_enabled),
            })),
          }
        : {}),
    };

    updateMutation.mutate(
      { id, payload },
      {
        onSuccess: () => {
          notify.success("Course updated successfully");

          const nextValues = {
            ...values,
            ...changedFields,
            ...(changedFields.chapters !== undefined
              ? {
                  chapters: changedFields.chapters.map((chapter, index) => ({
                    ...chapter,
                    idx: index + 1,
                  })),
                }
              : {}),
          };

          setValues(nextValues);
          setInitialValues(nextValues);
        },
        onError: (err) => {
          notify.error(err?.message || "Failed to update course");
        },
      }
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
        placeholder: "e.g., Operating Systems Basics",
      },
      {
        name: "code",
        label: "Code",
        type: "text",
        required: true,
        layout: "half",
        placeholder: "e.g., OS102",
      },
      {
        name: "department_id",
        label: "Department",
        type: "async-dropdown",
        required: true,
        layout: "half",
        placeholder: "Select department",
        dropdownProps: {
          options: departmentOptions,
          isLoading: isLoadingDepts,
          hasMore: false,
          getSublabel: (opt) =>
            opt?.meta?.code ? `Code: ${opt.meta.code}` : "",
        },
      },
      {
        name: "semester_id",
        label: "Semester",
        type: "async-dropdown",
        required: true,
        layout: "half",
        placeholder: "Select semester",
        dropdownProps: {
          options: semesterOptions,
          isLoading: isLoadingSems,
          hasMore: false,
          getSublabel: (opt) => opt?.meta?.code || "",
        },
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        layout: "full",
        placeholder: "Processes, memory, scheduling, files, and OS fundamentals.",
      },
      {
        name: "chapters",
        label: "Chapters",
        type: "child-table",
        layout: "full",
        childTableProps: {
          editable: true,
          allowAddRow: true,
          allowDeleteSelected: true,
          allowRowSelection: true,
          showMoreAction: false,
          useModal: false,
          addRowLabel: "Add Row",
          emptyMessage: "No chapters found.",
          titleField: "title",
          columns: [
            {
              key: "idx",
              label: "No.",
              width: "w-20",
              render: (_, __, rowIndex) => rowIndex + 1,
              readOnly: true,
            },
            {
              key: "title",
              label: "Chapter Title",
              width: "min-w-[280px]",
              type: "text",
              required: true,
              placeholder: "e.g., Introduction",
              layout: "full",
              editableInTable: true,
              editableInModal: false,
            },
            {
              key: "is_enabled",
              label: "Active",
              width: "w-28",
              type: "checkbox",
              checkboxLabel: "Enabled",
              render: (val) => (val ? "Active" : "Inactive"),
              layout: "half",
              editableInTable: true,
              editableInModal: false,
            },
          ],
        },
      },
    ],
    [departmentOptions, isLoadingDepts, semesterOptions, isLoadingSems]
  );

  const menuOptions = useMemo(
    () => [
      {
        label: "Delete",
        action: () => {
          if (confirm("Are you sure you want to delete this course?")) {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                notify.success("Document deleted");
                router.push("/admin/dashboards/admin-academic/courses");
              },
              onError: (err) => {
                notify.error(err?.message || "Failed to delete course");
              },
            });
          }
        },
      },
    ],
    [deleteMutation, id, notify, router]
  );

  const formTitle = courseData?.title
    ? `${id} - ${courseData.title}`
    : "Loading...";

  const formStatus = updateMutation.isPending
    ? "Saving..."
    : isDirty
      ? "Not Saved"
      : "Saved";

  if (isLoading || !values) {
    return (
      <div className="p-10 flex items-center justify-center">
        Loading...
      </div>
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
    </div>
  );
};

export default CourseDetailMain;