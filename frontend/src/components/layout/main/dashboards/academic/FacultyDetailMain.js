"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { useFacultyDetail, useUpdateFaculty, useDeleteFaculty } from "@/features/academic/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const TRACKED_FIELDS = ["name", "code"];

const facultySchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  code: z.string().min(1, "Code is required").max(20, "Code is too long"),
});

function normalizeFacultyToForm(faculty) {
  return {
    name: faculty?.name || "",
    code: faculty?.code || "",
    departments_preview: faculty?.departments_preview || [],
  };
}

function getChangedFields(initialValues, currentValues) {
  const changed = {};
  TRACKED_FIELDS.forEach((key) => {
    if (initialValues[key] !== currentValues[key]) {
      changed[key] = currentValues[key];
    }
  });
  return changed;
}

const FacultyDetailMain = ({ id }) => {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const { data: response, isLoading, isError } = useFacultyDetail(id);
  const facultyData = response?.data?.data || response?.data;

  useEffect(() => {
    if (!facultyData) return;
    const normalized = normalizeFacultyToForm(facultyData);
    setValues(normalized);
    setInitialValues(normalized);
    setErrors({});
  }, [facultyData]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const isDirty = Object.keys(changedFields).length > 0;

  const updateMutation = useUpdateFaculty();
  const deleteMutation = useDeleteFaculty();

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
    const result = facultySchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      notify.error("Please fix the highlighted fields");
      return;
    }

    if (!isDirty) {
      notify.warning("No changes in document");
      return;
    }

    updateMutation.mutate(
      { id, payload: changedFields },
      {
        onSuccess: () => notify.success("Faculty updated successfully"),
        onError: (err) => notify.error(err?.message || "Failed to update faculty"),
      }
    );
  };

  const formFields = [
    {
      name: "name",
      label: "Faculty Name",
      type: "text",
      required: true,
      layout: "full",
      placeholder: "e.g., Faculty of Computer Science",
    },
    {
      name: "code",
      label: "Code",
      type: "text",
      required: true,
      layout: "half",
      placeholder: "e.g., FCS",
    },
    {
      name: "departments_preview",
      label: "Departments Preview",
      type: "child-table",
      layout: "full",
      childTableProps: {
        editable: false,
        allowAddRow: false,
        allowDeleteSelected: false,
        allowRowSelection: false,
        showMoreAction: false,
        useModal: false,
        emptyMessage: "No departments found for this faculty.",
        columns: [
          {
            key: "idx",
            label: "No.",
            width: "w-16",
            render: (_, __, rowIndex) => rowIndex + 1,
            readOnly: true,
          },
          {
            key: "name",
            label: "Department Name",
            type: "text",
            required: true,
            readOnly: true,
          },
          {
            key: "code",
            label: "Code",
            type: "text",
            width: "w-32",
            readOnly: true,
          },
          {
            key: "is_enabled",
            label: "Status",
            type: "select",
            width: "w-32",
            options: [
              { label: "Active", value: true },
              { label: "Inactive", value: false },
            ],
            readOnly: true,
            render: (val) => (
              <span
                className={`text-xs px-2 py-1 rounded ${
                  val ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {val ? "Active" : "Inactive"}
              </span>
            ),
          },
        ],
      },
    },
  ];

  const menuOptions = [
    {
      label: "Delete",
      action: () => {
        if (confirm("Are you sure you want to delete this faculty?")) {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              notify.success("Document deleted");
              router.push("/admin/dashboards/admin-academic/faculties");
            },
            onError: (err) => notify.error(err?.message || "Failed to delete"),
          });
        }
      },
    },
  ];

  const formTitle = facultyData?.name ? `${id} - ${facultyData.name}` : "Loading...";
  const formStatus = updateMutation.isPending
    ? "Saving..."
    : isDirty
      ? "Not Saved"
      : "Saved";

  if (isLoading || !values) {
    return <div className="p-10 flex items-center justify-center">Loading...</div>;
  }

  if (isError) {
    return <div className="p-10 flex items-center justify-center text-red-500">Failed to load faculty.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
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

export default FacultyDetailMain;
