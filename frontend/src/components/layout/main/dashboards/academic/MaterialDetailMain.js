"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import {
  chaptersData,
  coursesData,
  materialsData,
} from "@/lib/mockAcademicData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const TRACKED_FIELDS = [
  "course_id",
  "chapter_id",
  "title",
  "material_type",
  "file",
  "file_size_mb",
  "page_count",
  "slide_count",
  "learning_objectives",
  "description",
  "is_downloadable",
  "is_enabled",
];

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

function normalizeMaterialToForm(material) {
  return {
    course_id: material?.course_id || "",
    chapter_id: material?.chapter_id || "",
    title: material?.title || "",
    material_type: material?.material_type || "",
    file: material?.file_name || null,
    file_size_mb:
      material?.file_size_mb === null || material?.file_size_mb === undefined
        ? ""
        : material.file_size_mb,
    page_count:
      material?.page_count === null || material?.page_count === undefined
        ? ""
        : material.page_count,
    slide_count:
      material?.slide_count === null || material?.slide_count === undefined
        ? ""
        : material.slide_count,
    learning_objectives: Array.isArray(material?.learning_objectives)
      ? material.learning_objectives
      : [],
    description: material?.description || "",
    is_downloadable: !!material?.is_downloadable,
    is_enabled: !!material?.is_enabled,
  };
}

function toComparable(values) {
  return {
    ...values,
    chapter_id: values.chapter_id || "",
    file:
      typeof values.file === "string" ? values.file : values.file?.name || "",
    learning_objectives: Array.isArray(values.learning_objectives)
      ? [...values.learning_objectives].map((x) => String(x).trim())
      : [],
  };
}

function getChangedFields(initialValues, currentValues) {
  const initial = toComparable(initialValues);
  const current = toComparable(currentValues);

  const changed = {};

  TRACKED_FIELDS.forEach((key) => {
    const oldVal = initial[key];
    const newVal = current[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changed[key] = currentValues[key];
    }
  });

  return changed;
}

function buildMaterialPayload(values) {
  return {
    course_id: values.course_id,
    chapter_id: values.chapter_id || null,
    title: values.title,
    material_type: values.material_type,
    page_count:
      values.material_type === "pdf"
        ? values.page_count === ""
          ? null
          : Number(values.page_count)
        : null,
    slide_count:
      values.material_type === "slides"
        ? values.slide_count === ""
          ? null
          : Number(values.slide_count)
        : null,
    file_size_mb:
      values.file_size_mb === "" ? null : Number(values.file_size_mb),
    learning_objectives: Array.isArray(values.learning_objectives)
      ? values.learning_objectives
      : [],
    description: values.description || "",
    is_downloadable: !!values.is_downloadable,
    is_enabled: !!values.is_enabled,
  };
}

// Mock fetch API
async function getMaterialById(id) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = materialsData.find((m) => String(m.id) === String(id));
  if (!found) {
    throw new Error("Material not found");
  }
  return found;
}

// Mock update API
async function updateMaterialById(id, payload) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    id,
    ...payload,
    file_name:
      typeof payload.file === "string"
        ? payload.file
        : payload.file?.name || null,
  };
}

const MaterialDetailMain = ({ id }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const [values, setValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["material", id],
    queryFn: () => getMaterialById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!data) return;

    const normalized = normalizeMaterialToForm(data);
    setValues(normalized);
    setInitialValues(normalized);
    setErrors({});
  }, [data]);

  const chapterOptions = useMemo(() => {
    if (!values?.course_id) return [];

    return chaptersData
      .filter(
        (chapter) => String(chapter.course_id) === String(values.course_id),
      )
      .map((chapter) => ({
        label: chapter.title,
        value: String(chapter.id),
      }));
  }, [values?.course_id]);

  const changedFields = useMemo(() => {
    if (!values || !initialValues) return {};
    return getChangedFields(initialValues, values);
  }, [initialValues, values]);

  const isDirty = Object.keys(changedFields).length > 0;

  const updateMutation = useMutation({
    mutationFn: async (payload) => updateMaterialById(id, payload),

    onSuccess: async (updated) => {
      const normalized = normalizeMaterialToForm({
        ...data,
        ...updated,
        file_name:
          typeof values?.file === "string"
            ? values.file
            : values?.file?.name || data?.file_name || null,
      });

      setValues(normalized);
      setInitialValues(normalized);
      setErrors({});

      notify.success("Document saved");

      await queryClient.invalidateQueries({ queryKey: ["material", id] });
      await queryClient.invalidateQueries({ queryKey: ["materials"] });
    },

    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save document";

      notify.error(String(msg));
    },
  });

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

    if (!values) return;

    setErrors({});

    const parsedValues = {
      ...values,
      file_size_mb:
        values.file_size_mb === "" ? undefined : Number(values.file_size_mb),
      page_count:
        values.page_count === "" ? undefined : Number(values.page_count),
      slide_count:
        values.slide_count === "" ? undefined : Number(values.slide_count),
    };

    const result = materialSchema.safeParse(parsedValues);

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

    const fullPayload = buildMaterialPayload(values);
    const changedOnly = getChangedFields(initialValues, values);

    const payload = {
      ...changedOnly,
      ...("course_id" in changedOnly
        ? { course_id: fullPayload.course_id }
        : {}),
      ...("chapter_id" in changedOnly
        ? { chapter_id: fullPayload.chapter_id }
        : {}),
      ...("title" in changedOnly ? { title: fullPayload.title } : {}),
      ...("material_type" in changedOnly
        ? {
            material_type: fullPayload.material_type,
            page_count: fullPayload.page_count,
            slide_count: fullPayload.slide_count,
          }
        : {}),
      ...("page_count" in changedOnly
        ? { page_count: fullPayload.page_count }
        : {}),
      ...("slide_count" in changedOnly
        ? { slide_count: fullPayload.slide_count }
        : {}),
      ...("file_size_mb" in changedOnly
        ? { file_size_mb: fullPayload.file_size_mb }
        : {}),
      ...("learning_objectives" in changedOnly
        ? { learning_objectives: fullPayload.learning_objectives }
        : {}),
      ...("description" in changedOnly
        ? { description: fullPayload.description }
        : {}),
      ...("is_downloadable" in changedOnly
        ? { is_downloadable: fullPayload.is_downloadable }
        : {}),
      ...("is_enabled" in changedOnly
        ? { is_enabled: fullPayload.is_enabled }
        : {}),
    };

    if ("file" in changedOnly) {
      payload.file = values.file;
    }

    updateMutation.mutate(payload);
  };

  const detailMenuOptions = [
    {
      label: "Print",
      action: () => window.print(),
    },
    {
      label: "Delete",
      action: () => {
        if (confirm("Are you sure you want to delete this material?")) {
          notify.success("Document deleted");
          router.push("/admin/dashboards/admin-academic/materials");
        }
      },
    },
  ];

  const countField =
    values?.material_type === "pdf"
      ? {
          name: "page_count",
          label: "Page Count",
          type: "number",
          layout: "third",
          placeholder: "e.g., 120",
        }
      : values?.material_type === "slides"
        ? {
            name: "slide_count",
            label: "Slide Count",
            type: "number",
            layout: "third",
            placeholder: "e.g., 45",
          }
        : null;

  const formFields = [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      layout: "full",
      placeholder: "e.g., Lecture 202",
    },
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
          meta: {
            code: c.code,
            description: c.department,
          },
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
      placeholder: values?.course_id ? "Select chapter" : "Select course first",
      dropdownProps: {
        options: chapterOptions,
        isLoading: false,
        hasMore: false,
      },
    },
    {
      name: "material_type",
      label: "Material Type",
      type: "async-dropdown",
      required: true,
      layout: "third",
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
      name: "file_size_mb",
      label: "File Size (MB)",
      type: "number",
      layout: "third",
      placeholder: "e.g., 12.5",
    },
    ...(countField ? [countField] : []),
    {
      name: "file",
      label: "Upload File",
      type: "file",
      required: false,
      layout: "full",
      sizeField: "file_size_mb",
    },
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
      required: false,
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

  const formTitle = values?.title ? `${id} - ${values.title}` : "Loading...";
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
        Failed to load material.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title={formTitle}
        status={formStatus}
        fields={formFields}
        menuOptions={detailMenuOptions}
        values={values}
        errors={errors}
        onChange={handleChange}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
};

export default MaterialDetailMain;
