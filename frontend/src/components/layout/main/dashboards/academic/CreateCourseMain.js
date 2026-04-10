"use client";

import Preloader from "@/components/shared/others/Preloader";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { useCreateCourse, useDepartmentsDropdown, useSemestersDropdown } from "@/features/academic/hooks";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";

const chapterSchema = z.object({
  idx: z.number().optional(),
  id: z.any().optional(),
  title: z.string().min(1, "Chapter title is required"),
  is_enabled: z.boolean().optional(),
});

const courseSchema = z.object({
  department_id: z.string().min(1, "Please select a Department"),
  semester_id: z.string().min(1, "Please select a Semester"),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  code: z.string().min(1, "Code is required").max(20, "Code is too long"),
  description: z.string().optional(),
  chapters: z.array(chapterSchema).optional(),
});

const CreateCourseMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const createMutation = useCreateCourse();

  // Dropdowns
  const { data: deptsRes, isLoading: isLoadingDepts } = useDepartmentsDropdown({ limit: 20 });
  const departmentOptions = Array.isArray(deptsRes?.data) ? deptsRes.data : (deptsRes?.data?.data || []);

  const { data: semsRes, isLoading: isLoadingSems } = useSemestersDropdown({ limit: 20 });
  const semesterOptions = Array.isArray(semsRes?.data) ? semsRes.data : (semsRes?.data?.data || []);
  const [values, setValues] = useState({
    department_id: "",
    semester_id: "",
    title: "",
    code: "",
    description: "",
    chapters: [],
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

    const result = courseSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      notify.error("Please fix the highlighted fields");
      return;
    }

    const payload = {
      department_id: Number(values.department_id),
      semester_id: Number(values.semester_id),
      title: values.title,
      code: values.code,
      description: values.description || "",
      chapters: (values.chapters || []).map((chapter, index) => ({
        number: index + 1,
        title: chapter.title,
        is_enabled: Boolean(chapter.is_enabled),
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        notify.success("Course created successfully");
        router.push("/admin/dashboards/admin-academic/courses");
      },
      onError: (err) => {
        notify.error(err?.message || "Failed to create course");
      }
    });
  };

  const formFields = [
    {
      name: "title",
      label: "Course Title",
      type: "text",
      required: true,
      layout: "full",
      placeholder: "e.g., Introduction to Programming",
    },
    {
      name: "code",
      label: "Code",
      type: "text",
      required: true,
      layout: "half",
      placeholder: "e.g., CS101",
    },
    {
      name: "department_id",
      label: "Department",
      type: "async-dropdown",
      required: true,
      layout: "half",
      placeholder: "Select department",
      dropdownProps: {
        options: departmentOptions,
        isLoading: isLoadingDepts,
        hasMore: false,
        getSublabel: (opt) => (opt?.meta?.code ? `Code: ${opt.meta.code}` : ""),
      },
    },
    {
      name: "semester_id",
      label: "Semester",
      type: "async-dropdown",
      required: true,
      layout: "half",
      placeholder: "Select semester",
      dropdownProps: {
        options: semesterOptions,
        isLoading: isLoadingSems,
        hasMore: false,
        getSublabel: (opt) => opt?.meta?.code || "",
      },
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: false,
      layout: "full",
      placeholder: "Basics of programming using Python.",
    },
    {
      name: "chapters",
      label: "Chapters",
      type: "child-table",
      layout: "full",
      childTableProps: {
        editable: true,
        allowAddRow: true,
        allowDeleteSelected: true,
        allowRowSelection: true,
        showMoreAction: false,
        useModal: false,
        addRowLabel: "Add Row",
        emptyMessage: "No chapters added yet.",
        titleField: "title",
        columns: [
          {
            key: "idx",
            label: "No.",
            width: "w-20",
            render: (_, __, rowIndex) => rowIndex + 1,
            readOnly: true,
          },
          {
            key: "title",
            label: "Chapter Title",
            width: "min-w-[280px]",
            type: "text",
            required: true,
            placeholder: "e.g., Introduction",
            layout: "full",
            editableInTable: true,
            editableInModal: false,
          },
          {
            key: "is_enabled",
            label: "Status",
            width: "w-28",
            type: "checkbox",
            checkboxLabel: "Enabled",
            layout: "half",
            editableInTable: true,
            editableInModal: false,
          },
        ],
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full">
      <FrappeForm
        title="New Course"
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

export default CreateCourseMain;
