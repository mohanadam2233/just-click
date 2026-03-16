"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const facultySchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  code: z.string().min(1, "Code is required").max(20, "Code is too long"),
});

const CreateFacultyMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState({
    name: "",
    code: "",
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

    const result = facultySchema.safeParse(values);

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
    };

    console.log("Create faculty payload:", payload);

    setTimeout(() => {
      setIsSaving(false);
      notify.success("Document saved");
      router.push("/admin/dashboards/admin-academic/faculties");
    }, 700);
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

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title="New Faculty"
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

export default CreateFacultyMain;
