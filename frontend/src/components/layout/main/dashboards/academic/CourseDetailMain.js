"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import {
  courseDetailsData,
  departmentsData,
  semestersData,
} from "@/lib/mockAcademicData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

function normalizeCourseToForm(item) {
  return {
    department_id: item?.department?.id ? String(item.department.id) : "",
    semester_id: item?.semester?.id ? String(item.semester.id) : "",
    title: item?.title || "",
    code: item?.code || "",
    description: item?.description || "",
    chapters: (item?.chapters || []).map((chapter, index) => ({
      __id: `chapter-${chapter.id || index}`,
      idx: chapter.number || index + 1,
      id: chapter.id,
      title: chapter.title || "",
      is_enabled: Boolean(chapter.is_enabled),
    })),
  };
}

function getChangedFields(initialValues, currentValues) {
  const changed = {};
  TRACKED_FIELDS.forEach((key) => {
    if (
      JSON.stringify(initialValues[key]) !== JSON.stringify(currentValues[key])
    ) {
      changed[key] = currentValues[key];
    }
  });
  return changed;
}

async function getCourseById(id) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const found = courseDetailsData.find(
    (item) => String(item.id) === String(id),
  );
  if (!found) throw new Error("Course not found");
  return found;
}

async function updateCourseById(id, payload) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { id, ...payload };
}

const CourseDetailMain = ({ id }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!data) return;
    const normalized = normalizeCourseToForm(data);
    setValues(normalized);
    setInitialValues(normalized);
    setErrors({});
  }, [data]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const isDirty = Object.keys(changedFields).length > 0;

  const semesterOptions = useMemo(() => {
    return semestersData.map((s) => ({
      label: `${s.name} (${s.academic_year_name})`,
      value: String(s.id),
      meta: { code: `No. ${s.number}` },
    }));
  }, []);

  const updateMutation = useMutation({
    mutationFn: async (payload) => updateCourseById(id, payload),
    onSuccess: async (updated) => {
      const merged = {
        ...data,
        ...updated,
        department: updated.department_id
          ? departmentsData.find(
              (d) => String(d.id) === String(updated.department_id),
            )
          : data.department,
        semester: updated.semester_id
          ? semestersData.find(
              (s) => String(s.id) === String(updated.semester_id),
            )
          : data.semester,
        chapters: updated.chapters
          ? updated.chapters.map((ch, index) => ({
              id: ch.id || `temp-${index + 1}`,
              number: index + 1,
              title: ch.title,
              is_enabled: ch.is_enabled,
            }))
          : data.chapters,
      };

      const normalized = normalizeCourseToForm(merged);
      setValues(normalized);
      setInitialValues(normalized);
      setErrors({});
      notify.success("Document saved");
      await queryClient.invalidateQueries({ queryKey: ["course", id] });
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      notify.error(error?.message || "Failed to save document");
    },
  });

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!values) return;

    setErrors({});
    const result = courseSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
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
      ...(changedFields.department_id
        ? { department_id: Number(changedFields.department_id) }
        : {}),
      ...(changedFields.semester_id
        ? { semester_id: Number(changedFields.semester_id) }
        : {}),
      ...(changedFields.chapters
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

    updateMutation.mutate(payload);
  };

  const formFields = [
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
        options: departmentsData.map((d) => ({
          label: d.name,
          value: String(d.id),
          meta: { code: d.code, description: d.faculty_name },
        })),
        isLoading: false,
        hasMore: false,
        getSublabel: (opt) => (opt?.meta?.code ? `Code: ${opt.meta.code}` : ""),
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
        isLoading: false,
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
          },
          {
            key: "is_enabled",
            label: "Active",
            width: "w-28",
            type: "checkbox",
            checkboxLabel: "Enabled",
            render: (val) => (val ? "Active" : "Inactive"),
            layout: "half",
          },
        ],
      },
    },
  ];

  const menuOptions = [
    {
      label: "Delete",
      action: () => {
        if (confirm("Are you sure you want to delete this course?")) {
          notify.success("Document deleted");
          router.push("/admin/dashboards/admin-academic/courses");
        }
      },
    },
  ];

  const formTitle = data?.title ? `${id} - ${data.title}` : "Loading...";
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
