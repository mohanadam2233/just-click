"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { 
  useDepartmentDetail, 
  useUpdateDepartment, 
  useDeleteDepartment,
  useFacultiesDropdown,
  useSemestersDropdown
} from "@/features/academic/hooks";
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
    faculty_id: item?.faculty?.id ? String(item.faculty.id) : (item?.faculty_id ? String(item.faculty_id) : ""),
    courses_preview: (item?.courses_preview || []).map((course, index) => ({
      __id: `course-preview-${course.id || index}`,
      id: course.id || null,
      idx: index + 1,
      title: course.name || course.title || "", // API might return `name` instead of `title`
      code: course.code || "",
      semester_label: course.semester?.name || course.semester_label || "",
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

const DepartmentDetailMain = ({ id }) => {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const { data: response, isLoading, isError } = useDepartmentDetail(id);
  const departmentData = response?.data?.data || response?.data;



  useEffect(() => {
    if (!departmentData) return;
    const normalized = normalizeDepartmentToForm(departmentData);
    setValues(normalized);
    setInitialValues(normalized);
    setErrors({});
  }, [departmentData]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const isDirty = Object.keys(changedFields).length > 0;

  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

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
    };

    updateMutation.mutate(
      { id, payload },
      {
        onSuccess: () => notify.success("Department updated successfully"),
        onError: (err) => notify.error(err?.message || "Failed to save document")
      }
    );
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
        options: facultiesOptions,
        isLoading: isLoadingFaculties,
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
        editable: false,
        allowAddRow: false,
        allowDeleteSelected: false,
        allowRowSelection: false,
        showRowSelection: false,
        showAddRowButton: false,
        showDeleteSelectedButton: false,
        showMoreAction: false,
        useModal: false,
        showFooter: false,
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
            readOnly: true,
          },
          {
            key: "code",
            label: "Code",
            width: "w-32",
            type: "text",
            readOnly: true,
          },
          {
            key: "semester_label",
            label: "Semester",
            width: "min-w-[240px]",
            type: "text",
            readOnly: true,
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
          deleteMutation.mutate(id, {
            onSuccess: () => {
              notify.success("Document deleted");
              router.push("/admin/dashboards/admin-academic/departments");
            },
            onError: (err) => notify.error(err?.message || "Failed to delete department")
          });
        }
      },
    },
  ];

  const formTitle = departmentData?.name ? `${id} - ${departmentData.name}` : "Loading...";
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
