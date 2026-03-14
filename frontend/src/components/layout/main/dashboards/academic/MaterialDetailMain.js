"use client";

import React, { useState, useEffect } from "react";
import FrappeForm from "@/components/shared/forms/FrappeForm";
import { z } from "zod";
import { departmentsData, coursesData, materialsData } from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";

// Zod Schema for validation
const materialSchema = z.object({
  course: z.string().min(1, "Please select a Course"),
  chapter_title: z.string().min(3, "Title must be at least 3 characters"),
  material_type: z.string().min(1, "Material Type is required"),
  description: z.string().optional(),
  file: z.any().optional(), // File is optional on update unless explicitly changed
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

const MaterialDetailMain = ({ id }) => {
  const router = useRouter();
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom Dynamic Title (e.g. "axmed" or "MAT-001")
  const title = values ? `${id} - ${values.chapter_title}` : "Loading...";

  useEffect(() => {
    // Simulate fetching complete material data by ID
    const found = materialsData.find(m => m.id === id);
    if (found) {
      setValues({
        ...found,
        // Map properties to match form fields
        file: found.file_name,
        file_size: found.size,
        description: found.description || "",
        has_sub_pages: found.type === "Slides" || found.type === "PDF",
        page_count: 24, // Mocking existing page count
        course: coursesData.find(c => c.name === found.course)?.id || "",
        material_type: found.type.toLowerCase() === "pdf document" ? "pdf" : found.type.toLowerCase(),
      });
    } else {
      // Fallback or 404
      setValues({});
    }
  }, [id]);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

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

    setTimeout(() => {
      setIsSaving(false);
      alert("Material updated successfully!");
    }, 1000);
  };

  // Define Top Bar actions specifically for this page
  const detailMenuOptions = [
    {
      label: "Print",
      action: () => {
        window.print();
      }
    },
    {
      label: "Email to Student",
      action: () => alert(`Opening email dialog for ${id}...`)
    },
    {
      label: "Delete",
      action: () => {
        if(confirm("Are you sure you want to delete this material?")) {
          alert("Deleted!");
          router.push("/admin/dashboards/admin-academic/materials");
        }
      }
    }
  ];

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
      required: false, // Not strictly required on update if existing file is okay
      layout: "half",
      sizeField: "file_size",
    },
    {
      name: "chapter_title",
      label: "Chapter Title",
      type: "text",
      layout: "half",
      required: true,
    },
    {
      name: "file_size",
      label: "File Size",
      type: "text",
      layout: "half",
      required: false,
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
      layout: "half",
      required: true,
      condition: (vals) => vals.has_sub_pages,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      layout: "full",
      required: false,
    }
  ];

  if (!values) return <div className="p-10 flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title={title}
        status="Open"
        fields={formFields}
        menuOptions={detailMenuOptions}
        values={values}
        errors={errors}
        onChange={handleChange}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default MaterialDetailMain;
