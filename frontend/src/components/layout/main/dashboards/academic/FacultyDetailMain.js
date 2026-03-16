"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { facultyDetailsData } from "@/lib/mockAcademicData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

async function getFacultyById(id) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const found = facultyDetailsData.find(
    (item) => String(item.id) === String(id),
  );
  if (!found) throw new Error("Faculty not found");
  return found;
}

async function updateFacultyById(id, payload) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { id, ...payload };
}

const FacultyDetailMain = ({ id }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faculty", id],
    queryFn: () => getFacultyById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!data) return;
    const normalized = normalizeFacultyToForm(data);
    setValues(normalized);
    setInitialValues(normalized);
    setErrors({});
  }, [data]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const isDirty = Object.keys(changedFields).length > 0;

  const updateMutation = useMutation({
    mutationFn: async (payload) => updateFacultyById(id, payload),
    onSuccess: async (updated) => {
      const normalized = normalizeFacultyToForm({ ...data, ...updated });
      setValues(normalized);
      setInitialValues(normalized);
      setErrors({});
      notify.success("Document saved");
      await queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      await queryClient.invalidateQueries({ queryKey: ["faculties"] });
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

    updateMutation.mutate(changedFields);
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
  ];

  const menuOptions = [
    {
      label: "Delete",
      action: () => {
        if (confirm("Are you sure you want to delete this faculty?")) {
          notify.success("Document deleted");
          router.push("/admin/dashboards/admin-academic/faculties");
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
        Failed to load faculty.
      </div>
    );
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

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-sm shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Departments Preview
        </h3>

        {data.departments_preview?.length ? (
          <div className="space-y-3">
            {data.departments_preview.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between rounded border border-gray-100 dark:border-slate-800 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {dept.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Code: {dept.code}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    dept.is_enabled
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {dept.is_enabled ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No departments found.</p>
        )}
      </div>
    </div>
  );
};

export default FacultyDetailMain;
