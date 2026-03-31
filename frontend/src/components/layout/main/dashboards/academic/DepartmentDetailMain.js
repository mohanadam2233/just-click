"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import {
  useDeleteDepartment,
  useDepartmentDetail,
  useFacultiesDropdown,
  useUpdateDepartment,
} from "@/features/academic/hooks";
import useNotify from "@/hooks/useNotify";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

const TRACKED_FIELDS = ["name", "code", "faculty_id"];

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

function extractDetailRecord(res) {
  return (
    res?.data?.data?.data ??
    res?.data?.data ??
    res?.data ??
    null
  );
}

function extractDropdownRows(res) {
  return (
    res?.data?.data?.data ??
    res?.data?.data ??
    res?.data ??
    []
  );
}

function normalizeDepartmentToForm(item) {
  return {
    name: item?.name || "",
    code: item?.code || "",
    faculty_id: item?.faculty?.id
      ? String(item.faculty.id)
      : item?.faculty_id
        ? String(item.faculty_id)
        : "",
    courses_preview: (item?.courses_preview || []).map((course, index) => ({
      __id: `course-preview-${course.id ?? index}`,
      id: course.id ?? null,
      idx: index + 1,
      title: course?.title || course?.name || "",
      code: course?.code || "",
      semester_label: course?.semester_label || course?.semester?.name || "",
    })),
  };
}

function getChangedFields(initialValues, currentValues) {
  const changed = {};

  TRACKED_FIELDS.forEach((key) => {
    const initialValue = initialValues?.[key];
    const currentValue = currentValues?.[key];

    if (JSON.stringify(initialValue) !== JSON.stringify(currentValue)) {
      changed[key] = currentValue;
    }
  });

  return changed;
}

function mapFacultyOptions(items = []) {
  return items.map((item) => ({
    label: item?.label || item?.name || `Faculty #${item?.id}`,
    value: String(item?.value ?? item?.id ?? ""),
    meta: item?.meta || {
      code: item?.code || "",
    },
  }));
}

const DepartmentDetailMain = ({ id }) => {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const hasInitializedRef = useRef(false);

  const { data: response, isLoading, isError } = useDepartmentDetail(id);
  const departmentData = useMemo(() => extractDetailRecord(response), [response]);

  const { data: facultiesRes, isLoading: isLoadingFaculties } =
    useFacultiesDropdown({
      limit: 500,
      offset: 0,
      active_only: true,
    });

  const facultiesRows = useMemo(() => {
    const rows = extractDropdownRows(facultiesRes);
    return Array.isArray(rows) ? rows : [];
  }, [facultiesRes]);

  const facultiesOptions = useMemo(() => {
    return mapFacultyOptions(facultiesRows);
  }, [facultiesRows]);

  useEffect(() => {
    if (!departmentData) return;

    const normalized = normalizeDepartmentToForm(departmentData);

    if (!hasInitializedRef.current) {
      setValues(normalized);
      setInitialValues(normalized);
      setErrors({});
      hasInitializedRef.current = true;
      return;
    }

    // if record changes after refetch and user has not edited yet, keep in sync
    if (!initialValues) {
      setValues(normalized);
      setInitialValues(normalized);
    }
  }, [departmentData, initialValues]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const isDirty = Object.keys(changedFields).length > 0;

  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

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
    const result = departmentSchema.safeParse(values);

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
      ...(changedFields.faculty_id !== undefined
        ? { faculty_id: Number(changedFields.faculty_id) }
        : {}),
    };

    updateMutation.mutate(
      { id, payload },
      {
        onSuccess: () => {
          notify.success("Department updated successfully");

          const nextValues = {
            ...values,
            ...changedFields,
          };

          setValues(nextValues);
          setInitialValues(nextValues);
        },
        onError: (err) => {
          notify.error(err?.message || "Failed to save document");
        },
      }
    );
  };

  const formFields = useMemo(
    () => [
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
          getSublabel: (opt) =>
            opt?.meta?.code ? `Code: ${opt.meta.code}` : "",
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
    ],
    [facultiesOptions, isLoadingFaculties]
  );

  const menuOptions = useMemo(
    () => [
      {
        label: "Delete",
        action: () => {
          if (confirm("Are you sure you want to delete this department?")) {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                notify.success("Document deleted");
                router.push("/admin/dashboards/admin-academic/departments");
              },
              onError: (err) => {
                notify.error(err?.message || "Failed to delete department");
              },
            });
          }
        },
      },
    ],
    [deleteMutation, id, notify, router]
  );

  const formTitle = departmentData?.name
    ? `${id} - ${departmentData.name}`
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