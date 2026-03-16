"use client";

import FrappeForm from "@/components/shared/forms/FrappeForm";
import useNotify from "@/hooks/useNotify";
import { departmentsData, semestersData } from "@/lib/mockAcademicData";
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

  const [values, setValues] = useState({
    department_id: "",
    semester_id: "",
    title: "",
    code: "",
    description: "",
    chapters: [],
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const semesterOptions = useMemo(() => {
    return semestersData.map((s) => ({
      label: `${s.name} (${s.academic_year_name})`,
      value: String(s.id),
      meta: { code: `No. ${s.number}` },
    }));
  }, []);

  const chapterTitleOptions = useMemo(() => {
    return [
      {
        label: "Introduction",
        value: "Introduction",
        meta: { code: "CH-01", description: "Course overview and basics" },
      },
      {
        label: "Core Concepts",
        value: "Core Concepts",
        meta: { code: "CH-02", description: "Main theory and foundation" },
      },
      {
        label: "Advanced Topics",
        value: "Advanced Topics",
        meta: { code: "CH-03", description: "Higher-level concepts" },
      },
    ];
  }, []);

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

    const result = courseSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSaving(false);
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

    console.log("Create course payload:", payload);

    setTimeout(() => {
      setIsSaving(false);
      notify.success("Document saved");
      router.push("/admin/dashboards/admin-academic/courses");
    }, 700);
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
        options: departmentsData.map((d) => ({
          label: d.name,
          value: String(d.id),
          meta: { code: d.code, description: d.faculty_name },
        })),
        isLoading: false,
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
        isLoading: false,
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
            type: "async-dropdown",
            required: true,
            placeholder: "Select chapter title",
            layout: "full",
            editableInTable: true,
            editableInModal: false,
            dropdownProps: {
              options: chapterTitleOptions,
              isLoading: false,
              hasMore: false,
              getSublabel: (opt) =>
                opt?.meta?.code
                  ? `${opt.meta.code} • ${opt.meta.description}`
                  : "",
            },
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
        isSaving={isSaving}
      />
    </div>
  );
};

export default CreateCourseMain;
