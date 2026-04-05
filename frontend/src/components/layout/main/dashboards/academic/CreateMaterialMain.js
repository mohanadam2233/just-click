"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import {
  useChaptersDropdown,
  useCoursesDropdown,
} from "@/features/academic/hooks";
import { useCreateMaterial } from "@/features/materials/hooks";
import useNotify from "@/hooks/useNotify";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

function normalizeDropdownValue(value) {
  if (value == null) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    if (value.value != null) return String(value.value);
    if (value.id != null) return String(value.id);
  }

  return "";
}

const CreateMaterialMain = () => {
  const router = useRouter();
  const notify = useNotify();
  const createMutation = useCreateMaterial();

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

  const { data: coursesRes, isLoading: isLoadingCourses } = useCoursesDropdown(
    { limit: 500 },
    { staleTime: 60_000 },
  );

  const coursesOptions = Array.isArray(coursesRes?.data)
    ? coursesRes.data
    : coursesRes?.data?.data || [];

  const normalizedCourseId = normalizeDropdownValue(values.course_id);

  const { data: chaptersRes, isLoading: isLoadingChapters } =
    useChaptersDropdown(
      { course_id: normalizedCourseId, limit: 500 },
      { enabled: !!normalizedCourseId, staleTime: 60_000 },
    );
  const chapterOptions = Array.isArray(chaptersRes?.data)
    ? chaptersRes.data
    : chaptersRes?.data?.data || [];

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

  const handleSave = (e) => {
    e?.preventDefault?.();
    setErrors({});

    const courseId = normalizeDropdownValue(values.course_id);
    const chapterId = normalizeDropdownValue(values.chapter_id);
    const materialType = normalizeDropdownValue(values.material_type);

    const result = materialSchema.safeParse({
      ...values,
      course_id: courseId,
      chapter_id: chapterId,
      material_type: materialType,
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
        const key = issue.path?.[0];
        if (key) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      notify.error("Please fix the highlighted fields");
      return;
    }

    const payload = {
      course_id: Number(courseId),
      chapter_id: chapterId ? Number(chapterId) : null,
      title: String(values.title || "").trim(),
      material_type: materialType,
      page_count:
        materialType === "pdf" && values.page_count !== ""
          ? Number(values.page_count)
          : null,
      slide_count:
        materialType === "slides" && values.slide_count !== ""
          ? Number(values.slide_count)
          : null,
      file_size_mb:
        values.file_size_mb !== "" ? Number(values.file_size_mb) : null,
      learning_objectives: Array.isArray(values.learning_objectives)
        ? values.learning_objectives.filter(Boolean)
        : [],
      description: String(values.description || "").trim(),
      is_downloadable: Boolean(values.is_downloadable),
      is_enabled: Boolean(values.is_enabled),
    };

    console.log("CreateMaterialMain final payload:", payload);
    console.log("CreateMaterialMain final file:", values.file);

    createMutation.mutate(
      {
        payload,
        file: values.file || null,
      },
      {
        onSuccess: () => {
          notify.success("Material saved successfully!");
          router.push("/admin/dashboards/admin-academic/materials");
        },
        onError: (error) => {
          const msg =
            error?.info?.message ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to save material";

          console.error("Create material error:", error);
          notify.error(String(msg));
        },
      },
    );
  };

  const countField =
    normalizeDropdownValue(values.material_type) === "pdf"
      ? {
          name: "page_count",
          label: "Page Count",
          type: "number",
          layout: "half",
          placeholder: "e.g., 120",
        }
      : normalizeDropdownValue(values.material_type) === "slides"
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
        options: coursesOptions,
        isLoading: isLoadingCourses,
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
      placeholder: normalizedCourseId
        ? "Select chapter"
        : "Select course first",
      dropdownProps: {
        options: chapterOptions,
        isLoading: isLoadingChapters,
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
      fileProps: {
        buttonLabel: "Choose File",
        helperText: "Upload material file",
      },
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
        isSaving={createMutation.isPending}
      />
    </div>
  );
};

export default CreateMaterialMain;
