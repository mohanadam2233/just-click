"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { facultiesData } from "@/lib/mockAcademicData";
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
  const notify = useNotify();

  const [values, setValues] = useState({
    name: "",
    code: "",
    faculty_id: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrors({});
    setIsSaving(true);

    const result = departmentSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSaving(false);
      notify.error("Please fix the highlighted fields");
      return;
    }

    const payload = {
      name: values.name,
      code: values.code,
      faculty_id: Number(values.faculty_id),
    };

    console.log("Create department payload:", payload);

    setTimeout(() => {
      setIsSaving(false);
      notify.success("Document saved");
      router.push("/admin/dashboards/admin-academic/departments");
    }, 700);
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
        isSaving={isSaving}
      />
    </div>
  );
};

export default CreateDepartmentMain;
