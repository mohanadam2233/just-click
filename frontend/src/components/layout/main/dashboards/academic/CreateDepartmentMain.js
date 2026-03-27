"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { useCreateDepartment, useFacultiesDropdown } from "@/features/academic/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  code: z.string().min(1, "Code is required").max(20, "Code is too long"),
  faculty_id: z.string().min(1, "Please select a Faculty"),
});

const CreateDepartmentMain = () => {
  const router = useRouter();
  // Fetch dropdown data
  const { data: facultiesRes, isLoading: isLoadingFaculties } = useFacultiesDropdown({ limit: 500 });
  const facultiesOptions = Array.isArray(facultiesRes?.data) ? facultiesRes.data : (facultiesRes?.data?.data || []);const notify = useNotify();

  const createMutation = useCreateDepartment();

  const [values, setValues] = useState({
    name: "",
    code: "",
    faculty_id: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrors({});

    const result = departmentSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      notify.error("Please fix the highlighted fields");
      return;
    }

    const payload = {
      name: values.name,
      code: values.code,
      faculty_id: Number(values.faculty_id),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        notify.success("Department created successfully");
        router.push("/admin/dashboards/admin-academic/departments");
      },
      onError: (err) => {
        notify.error(err?.message || "Failed to create department");
      }
    });
  };

  const formFields = [
    {
      name: "name",
      label: "Department Name",
      type: "text",
      required: true,
      layout: "full",
      placeholder: "e.g., Civil Engineering",
    },
    {
      name: "code",
      label: "Code",
      type: "text",
      required: true,
      layout: "half",
      placeholder: "e.g., CS-01",
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
  ];

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title="New Department"
        status="Not Saved"
        fields={formFields}
        values={values}
        errors={errors}
        onChange={handleChange}
        onSave={handleSave}
        isSaving={createMutation.isPending}
      />
    </div>
  );
};

export default CreateDepartmentMain;
