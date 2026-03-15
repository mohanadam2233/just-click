"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import { coursesData } from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";

const materialSchema = z
  .object({
    course_id: z.string().min(1, "Please select a Course"),
    chapter_id: z.string().optional(),
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    material_type: z.string().min(1, "Material Type is required"),
    file: z.any().optional(),
    file_size_mb: z
      .union([z.number(), z.nan()])
      .optional()
      .transform((val) => (Number.isNaN(val) ? undefined : val)),
    page_count: z
      .union([z.number(), z.nan()])
      .optional()
      .transform((val) => (Number.isNaN(val) ? undefined : val)),
    slide_count: z
      .union([z.number(), z.nan()])
      .optional()
      .transform((val) => (Number.isNaN(val) ? undefined : val)),
    learning_objectives: z.array(z.string()).optional(),
    description: z.string().optional(),
    is_downloadable: z.boolean().default(true),
    is_enabled: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (
      data.material_type === "pdf" &&
      (!data.page_count || data.page_count <= 0)
    ) {
      ctx.addIssue({
        path: ["page_count"],
        message: "Page count must be greater than 0 for PDF materials",
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      data.material_type === "slides" &&
      (!data.slide_count || data.slide_count <= 0)
    ) {
      ctx.addIssue({
        path: ["slide_count"],
        message: "Slide count must be greater than 0 for slide materials",
        code: z.ZodIssueCode.custom,
      });
    }
  });

const mockChapters = [
  { id: 47, course_id: 16, title: "Introduction to Programming" },
  { id: 48, course_id: 16, title: "Variables and Data Types" },
  { id: 49, course_id: 16, title: "Control Flow" },
  { id: 50, course_id: 17, title: "Database Basics" },
];

const CreateMaterialMain = () => {
  const router = useRouter();

  const [values, setValues] = useState({
    course_id: "",
    chapter_id: "",
    title: "",
    material_type: "",
    file: null,
    file_size_mb: "",
    page_count: "",
    slide_count: "",
    learning_objectives: [],
    description: "",
    is_downloadable: true,
    is_enabled: true,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const chapterOptions = useMemo(() => {
    if (!values.course_id) return [];

    return mockChapters
      .filter(
        (chapter) => String(chapter.course_id) === String(values.course_id),
      )
      .map((chapter) => ({
        label: chapter.title,
        value: String(chapter.id),
      }));
  }, [values.course_id]);

  const handleChange = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "course_id") {
        next.chapter_id = "";
      }

      if (field === "material_type") {
        next.page_count = "";
        next.slide_count = "";
      }

      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    const result = materialSchema.safeParse({
      ...values,
      file_size_mb:
        values.file_size_mb === "" ? undefined : Number(values.file_size_mb),
      page_count:
        values.page_count === "" ? undefined : Number(values.page_count),
      slide_count:
        values.slide_count === "" ? undefined : Number(values.slide_count),
    });

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSaving(false);
      return;
    }

    const payload = {
      course_id: Number(values.course_id),
      chapter_id: values.chapter_id ? Number(values.chapter_id) : null,
      title: values.title,
      material_type: values.material_type,
      page_count:
        values.material_type === "pdf" ? Number(values.page_count || 0) : null,
      slide_count:
        values.material_type === "slides"
          ? Number(values.slide_count || 0)
          : null,
      file_size_mb: values.file_size_mb ? Number(values.file_size_mb) : null,
      learning_objectives: values.learning_objectives?.length
        ? values.learning_objectives
        : [],
      description: values.description || "",
      is_downloadable: values.is_downloadable,
      is_enabled: values.is_enabled,
    };

    console.log("Material payload:", payload);

    setTimeout(() => {
      setIsSaving(false);
      alert("Material saved successfully!");
      router.push("/admin/dashboards/admin-academic/materials");
    }, 1200);
  };

  const countField =
    values.material_type === "pdf"
      ? {
          name: "page_count",
          label: "Page Count",
          type: "number",
          layout: "half",
          placeholder: "e.g., 120",
        }
      : values.material_type === "slides"
        ? {
            name: "slide_count",
            label: "Slide Count",
            type: "number",
            layout: "half",
            placeholder: "e.g., 45",
          }
        : null;

  const formFields = [
    {
      name: "course_id",
      label: "Course",
      type: "async-dropdown",
      required: true,
      layout: "half",
      placeholder: "Select course",
      dropdownProps: {
        options: coursesData.map((c) => ({
          label: `${c.code} - ${c.name}`,
          value: String(c.id),
          meta: { code: c.code },
        })),
        isLoading: false,
        hasMore: false,
        getSublabel: (opt) => (opt?.meta?.code ? `Code: ${opt.meta.code}` : ""),
      },
    },
    {
      name: "chapter_id",
      label: "Chapter",
      type: "async-dropdown",
      required: false,
      layout: "half",
      placeholder: values.course_id ? "Select chapter" : "Select course first",
      dropdownProps: {
        options: chapterOptions,
        isLoading: false,
        hasMore: false,
      },
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      layout: "half",
      placeholder: "e.g., Lecture 202",
    },
    {
      name: "material_type",
      label: "Material Type",
      type: "async-dropdown",
      required: true,
      layout: "half",
      placeholder: "Select material type",
      dropdownProps: {
        options: [
          { label: "PDF Document", value: "pdf" },
          { label: "Presentation (Slides)", value: "slides" },
          { label: "Video", value: "video" },
          { label: "Other", value: "other" },
        ],
        isLoading: false,
        hasMore: false,
      },
    },
    {
      name: "file",
      label: "Upload File",
      type: "file",
      required: false,
      layout: "half",
      sizeField: "file_size_mb",
    },
    {
      name: "file_size_mb",
      label: "File Size (MB)",
      type: "number",
      layout: "half",
      placeholder: "e.g., 12.5",
    },
    ...(countField ? [countField] : []),
    {
      name: "learning_objectives",
      label: "Learning Objectives",
      type: "tags",
      layout: "full",
      placeholder: "Type objective and press Enter",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: false,
      layout: "full",
      placeholder: "Short summary...",
    },
    {
      name: "is_downloadable",
      label: "Is Downloadable",
      type: "checkbox",
      layout: "half",
      checkboxLabel: "Downloadable",
      checkboxDescription: "Users can download this file.",
    },
    {
      name: "is_enabled",
      label: "Is Enabled",
      type: "checkbox",
      layout: "half",
      checkboxLabel: "Enabled",
      checkboxDescription: "Visible in the system.",
    },
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
