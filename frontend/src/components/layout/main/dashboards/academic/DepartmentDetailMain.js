"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import {
  departmentDetailsData,
  facultiesData,
  semestersData,
} from "@/lib/mockAcademicData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const TRACKED_FIELDS = ["name", "code", "faculty_id", "courses_preview"];

const coursePreviewRowSchema = z.object({
  idx: z.number().optional(),
  id: z.any().optional(),
  title: z.string().optional(),
  code: z.string().optional(),
  semester_label: z.string().optional(),
});

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  code: z.string().min(1, "Code is required").max(20, "Code is too long"),
  faculty_id: z.string().min(1, "Please select a Faculty"),
  courses_preview: z.array(coursePreviewRowSchema).optional(),
});

function normalizeDepartmentToForm(item) {
  return {
    name: item?.name || "",
    code: item?.code || "",
    faculty_id: item?.faculty?.id ? String(item.faculty.id) : "",
    courses_preview: (item?.courses_preview || []).map((course, index) => ({
      __id: `course-preview-${course.id || index}`,
      id: course.id || null,
      idx: index + 1,
      title: course.title || "",
      code: course.code || "",
      semester_label: course.semester_label || "",
    })),
  };
}

function getChangedFields(initialValues, currentValues) {
  const changed = {};

  TRACKED_FIELDS.forEach((key) => {
    const initialValue = initialValues?.[key];
    const currentValue = currentValues?.[key];

    const isDifferent =
      typeof initialValue === "object" || typeof currentValue === "object"
        ? JSON.stringify(initialValue) !== JSON.stringify(currentValue)
        : initialValue !== currentValue;

    if (isDifferent) {
      changed[key] = currentValue;
    }
  });

  return changed;
}

async function getDepartmentById(id) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const found = departmentDetailsData.find(
    (item) => String(item.id) === String(id),
  );
  if (!found) throw new Error("Department not found");
  return found;
}

async function updateDepartmentById(id, payload) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { id, ...payload };
}

const DepartmentDetailMain = ({ id }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["department", id],
    queryFn: () => getDepartmentById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!data) return;
    const normalized = normalizeDepartmentToForm(data);
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
    return semestersData.map((semester) => ({
      label: `${semester.name} (${semester.academic_year_name})`,
      value: `${semester.name} (${semester.academic_year_name})`,
      meta: {
        code: `No. ${semester.number}`,
      },
    }));
  }, []);

  const updateMutation = useMutation({
    mutationFn: async (payload) => updateDepartmentById(id, payload),
    onSuccess: async (updated) => {
      const normalized = {
        ...data,
        ...updated,
        faculty: updated.faculty_id
          ? facultiesData.find(
              (f) => String(f.id) === String(updated.faculty_id),
            )
          : data.faculty,
        courses_preview: updated.courses_preview
          ? updated.courses_preview
          : data.courses_preview || [],
      };

      const formData = normalizeDepartmentToForm(normalized);
      setValues(formData);
      setInitialValues(formData);
      setErrors({});
      notify.success("Document saved");
      await queryClient.invalidateQueries({ queryKey: ["department", id] });
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
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
    const result = departmentSchema.safeParse(values);

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
      ...(changedFields.faculty_id
        ? { faculty_id: Number(changedFields.faculty_id) }
        : {}),
      ...(changedFields.courses_preview
        ? {
            courses_preview: changedFields.courses_preview.map(
              (course, index) => ({
                id: course.id || null,
                idx: index + 1,
                title: course.title || "",
                code: course.code || "",
                semester_label: course.semester_label || "",
              }),
            ),
          }
        : {}),
    };

    updateMutation.mutate(payload);
  };

  const formFields = [
    {
      name: "name",
      label: "Department Name",
      type: "text",
      required: true,
      layout: "full",
      placeholder: "e.g., Information Systems",
    },
    {
      name: "code",
      label: "Code",
      type: "text",
      required: true,
      layout: "half",
      placeholder: "e.g., IS",
    },
    {
      name: "faculty_id",
      label: "Faculty",
      type: "async-dropdown",
      required: true,
      layout: "half",
      placeholder: "Select faculty",
      dropdownProps: {
        options: facultiesData.map((f) => ({
          label: `${f.code} - ${f.name}`,
          value: String(f.id),
          meta: { code: f.code },
        })),
        isLoading: false,
        hasMore: false,
        getSublabel: (opt) => (opt?.meta?.code ? `Code: ${opt.meta.code}` : ""),
      },
    },
    {
      name: "courses_preview",
      label: "Courses Preview",
      type: "child-table",
      layout: "full",
      childTableProps: {
        editable: true,
        allowAddRow: true,
        allowDeleteSelected: false,
        allowRowSelection: false,
        showRowSelection: true,
        showAddRowButton: true,
        showDeleteSelectedButton: false,
        showMoreAction: false,
        useModal: false,
        showFooter: true,
        addRowLabel: "Add Row",
        emptyMessage: "No courses found.",
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
            label: "Course Title",
            width: "min-w-[260px]",
            type: "text",
            placeholder: "Enter course title",
            editableInTable: (row) => !row?.id,
            editableInModal: false,
          },
          {
            key: "code",
            label: "Code",
            width: "w-32",
            type: "text",
            placeholder: "Enter code",
            editableInTable: (row) => !row?.id,
            editableInModal: false,
          },
          {
            key: "semester_label",
            label: "Semester",
            width: "min-w-[240px]",
            type: "async-dropdown",
            placeholder: "Select semester",
            editableInTable: true,
            editableInModal: false,
            dropdownProps: {
              options: semesterOptions,
              isLoading: false,
              hasMore: false,
              getSublabel: (opt) => opt?.meta?.code || "",
            },
          },
        ],
      },
    },
  ];

  const menuOptions = [
    {
      label: "Delete",
      action: () => {
        if (confirm("Are you sure you want to delete this department?")) {
          notify.success("Document deleted");
          router.push("/admin/dashboards/admin-academic/departments");
        }
      },
    },
  ];

  const formTitle = data?.name ? `${id} - ${data.name}` : "Loading...";
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
        Failed to load department.
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

export default DepartmentDetailMain;
