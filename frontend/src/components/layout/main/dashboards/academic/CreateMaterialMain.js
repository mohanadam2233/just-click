"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import { coursesData } from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

// Zod Schema for validation
const materialSchema = z.object({
  course: z.string().min(1, "Please select a Course"),
  chapter_title: z.string().min(3, "Title must be at least 3 characters"),
  material_type: z.string().min(1, "Material Type is required"),
  description: z.string().optional(),
  file: z.any().refine((val) => val, "Please upload a file"),
  file_size: z.string().optional(),
  has_sub_pages: z.boolean().default(false).optional(),
  page_count: z.number().optional(),
}).superRefine((data, ctx) => {
  if (data.has_sub_pages && (!data.page_count || data.page_count <= 0)) {
    ctx.addIssue({
      path: ["page_count"],
      message: "Count must be > 0",
      code: z.ZodIssueCode.custom,
    });
  }
});

const CreateMaterialMain = () => {
  const router = useRouter();
  const [values, setValues] = useState({
    course: "",
    chapter_title: "",
    material_type: "",
    file: null,
    file_size: "",
    description: "",
    has_sub_pages: false,
    page_count: 0,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    // Validate using Zod
    const result = materialSchema.safeParse(values);
    
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSaving(false);
      return;
    }

    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
      alert("Material saved successfully!");
      router.push("/admin/dashboards/admin-academic/materials");
    }, 1500);
  };

  // Field configurations mapping to the 12-column grid system
  const formFields = [
    {
      name: "course",
      label: "Course",
      type: "select",
      required: true,
      layout: "half",
      options: coursesData.map((c) => ({ label: `${c.code} - ${c.name}`, value: c.id })),
    },
    {
      name: "file",
      label: "Upload File",
      type: "file",
      required: true,
      layout: "half",
      sizeField: "file_size", // Auto updates file_size field when chosen
    },
    {
      name: "chapter_title",
      label: "Chapter Title",
      type: "text",
      required: true,
      layout: "half",
      placeholder: "e.g., Intro to Algorithms",
    },
    {
      name: "file_size",
      label: "File Size",
      type: "text",
      layout: "full",
      required: false,
      placeholder: "Calculated automatically...",
    },
    {
      name: "material_type",
      label: "Material Type",
      type: "select",
      required: true,
      layout: "half",
      options: [
        { label: "PDF Document", value: "pdf" },
        { label: "Presentation (Slides)", value: "slides" },
        { label: "Video", value: "video" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "has_sub_pages",
      label: "Has Slides/Pages?",
      type: "checkbox",
      layout: "half",
      required: false,
    },
    {
      name: "page_count",
      label: "Slide / Page Count",
      type: "number",
      required: true,
      layout: "half",
      placeholder: "e.g., 24",
      condition: (vals) => vals.has_sub_pages,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: false,
      layout: "full",
      placeholder: "Short summary...",
    }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title="New Material"
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

export default CreateMaterialMain;
