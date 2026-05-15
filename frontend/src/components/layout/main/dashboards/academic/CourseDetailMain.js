"use client";

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

const TRACKED_FIELDS = ["title", "code", "description", "offerings"];

const chapterSchema = z.object({
  idx: z.number().optional(),
  id: z.any().optional(),
  __id: z.string().optional(),
  number: z.number().optional(),
  title: z.string().optional(),
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

  academic_year_id: z.any().optional(),
  academic_year_name: z.string().optional(),

  custom_title: z.string().optional(),
  credit_hours: z.any().optional(),
  is_enabled: z.boolean().optional(),

  chapters: z.array(chapterSchema).optional(),
  chapters_summary: z.string().optional(),
});

const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  code: z.string().min(1, "Code is required").max(20, "Code is too long"),
  description: z.string().optional(),
  offerings: z.array(offeringSchema).optional(),
});

function extractDetailRecord(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? null;
}

function extractDropdownRows(res) {
  return res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
}

function makeRowId(prefix, id, index) {
  return `${prefix}-${id ?? `new-${index}`}`;
}

function buildChaptersSummary(chapters = []) {
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return "No chapters";
  }

  return chapters
    .map((chapter, index) => {
      const title = chapter?.title || "Untitled";
      return `${index + 1}. ${title}`;
    })
    .join(", ");
}

function normalizeCourseToForm(item) {
  return {
    title: item?.title || "",
    code: item?.code || "",
    description: item?.description || "",

    offerings: (item?.offerings || []).map((offering, offeringIndex) => {
      const chapters = (offering?.chapters || []).map(
        (chapter, chapterIndex) => ({
          __id: makeRowId("chapter", chapter?.id, chapterIndex),
          idx: chapter?.number || chapterIndex + 1,
          id: chapter?.id ?? null,
          number: chapter?.number || chapterIndex + 1,
          title: chapter?.title || "",
          description: chapter?.description || "",
          is_enabled: Boolean(chapter?.is_enabled),
        }),
      );

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

        academic_year_id: offering?.academic_year_id ?? null,
        academic_year_name: offering?.academic_year_name || "",

        custom_title: offering?.custom_title || "",
        credit_hours:
          offering?.credit_hours !== undefined &&
          offering?.credit_hours !== null
            ? String(offering.credit_hours)
            : "",

        is_enabled: Boolean(offering?.is_enabled),

        chapters,
        chapters_summary: buildChaptersSummary(chapters),
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
      meta: item?.meta || {
        code: item?.code || "",
      },
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
        meta: {
          code: "",
        },
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
        meta: {
          code: offering.semester_code || "",
        },
      });
    }
  });

  return Array.from(map.values());
}

function cleanOfferingsForState(offerings = []) {
  return offerings.map((offering, index) => {
    const chapters = Array.isArray(offering?.chapters)
      ? offering.chapters.map((chapter, chapterIndex) => ({
          ...chapter,
          idx: chapterIndex + 1,
          number: chapterIndex + 1,
        }))
      : [];

    return {
      ...offering,
      idx: index + 1,
      chapters,
      chapters_summary: buildChaptersSummary(chapters),
    };
  });
}

function buildUpdatePayload(changedFields) {
  const payload = {
    ...changedFields,
  };

  if (changedFields.offerings !== undefined) {
    payload.offerings = changedFields.offerings.map((offering) => ({
      id: offering.id || null,

      department_id: Number(offering.department_id),
      semester_id: Number(offering.semester_id),

      academic_year_id: offering.academic_year_id
        ? Number(offering.academic_year_id)
        : null,

      custom_title: offering.custom_title || "",

      credit_hours:
        offering.credit_hours !== "" &&
        offering.credit_hours !== null &&
        offering.credit_hours !== undefined
          ? Number(offering.credit_hours)
          : null,

      is_enabled: Boolean(offering.is_enabled),

      chapters: (offering.chapters || []).map((chapter, chapterIndex) => ({
        id: chapter.id || null,
        number: chapterIndex + 1,
        title: chapter.title || "",
        description: chapter.description || "",
        is_enabled: Boolean(chapter.is_enabled),
      })),
    }));
  }

  return payload;
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

  const baseDepartmentOptions = useMemo(() => {
    return mapDepartmentOptions(departmentRows);
  }, [departmentRows]);

  const baseSemesterOptions = useMemo(() => {
    return mapSemesterOptions(semesterRows);
  }, [semesterRows]);

  const departmentOptions = useMemo(() => {
    return mergeCurrentDepartmentOptions(
      baseDepartmentOptions,
      values?.offerings || [],
    );
  }, [baseDepartmentOptions, values?.offerings]);

  const semesterOptions = useMemo(() => {
    return mergeCurrentSemesterOptions(
      baseSemesterOptions,
      values?.offerings || [],
    );
  }, [baseSemesterOptions, values?.offerings]);

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

    const payload = buildUpdatePayload(changedFields);

    updateMutation.mutate(
      { id, payload },
      {
        onSuccess: (res) => {
          notify.success("Course updated successfully");

          const updatedRecord = extractDetailRecord(res);

          if (updatedRecord) {
            const normalized = normalizeCourseToForm(updatedRecord);
            setValues(normalized);
            setInitialValues(normalized);
            return;
          }

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
        },
        onError: (err) => {
          notify.error(err?.message || "Failed to update course");
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
          showMoreAction: true,
          useModal: true,
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
            academic_year_id: null,
            academic_year_name: "",
            custom_title: "",
            credit_hours: "",
            is_enabled: true,
            chapters: [],
            chapters_summary: "No chapters",
          },

          columns: [
            {
              key: "idx",
              label: "No.",
              width: "w-16",
              render: (_, __, rowIndex) => rowIndex + 1,
              readOnly: true,
            },
            {
              key: "department_id",
              label: "Department",
              width: "min-w-[220px]",
              type: "async-dropdown",
              required: true,
              placeholder: "Select department",
              editableInTable: true,
              editableInModal: true,
              dropdownProps: {
                options: departmentOptions,
                isLoading: isLoadingDepts,
                hasMore: false,
                getSublabel: (opt) =>
                  opt?.meta?.code ? `Code: ${opt.meta.code}` : "",
              },
            },
            {
              key: "semester_id",
              label: "Semester",
              width: "min-w-[180px]",
              type: "async-dropdown",
              required: true,
              placeholder: "Select semester",
              editableInTable: true,
              editableInModal: true,
              dropdownProps: {
                options: semesterOptions,
                isLoading: isLoadingSems,
                hasMore: false,
                getSublabel: (opt) => opt?.meta?.code || "",
              },
            },
            {
              key: "academic_year_name",
              label: "Academic Year",
              width: "min-w-[160px]",
              type: "text",
              readOnly: true,
              editableInTable: false,
              editableInModal: false,
              placeholder: "Auto",
              render: (value) => value || "-",
            },

            {
              key: "chapters_summary",
              label: "Chapters",
              width: "min-w-[320px]",
              type: "text",
              readOnly: true,
              editableInTable: false,
              editableInModal: false,
              render: (_, row) => buildChaptersSummary(row?.chapters || []),
            },
            {
              key: "is_enabled",
              label: "Active",
              width: "w-28",
              type: "checkbox",
              checkboxLabel: "Enabled",
              render: (value) => (value ? "Active" : "Inactive"),
              editableInTable: true,
              editableInModal: true,
            },
          ],
        },
      },
    ],
    [departmentOptions, semesterOptions, isLoadingDepts, isLoadingSems],
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
    [deleteMutation, id, notify, router],
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
    </div>
  );
};

export default CourseDetailMain;
