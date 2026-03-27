"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { useCoursesList, useBulkDeleteCourses, useDepartmentsDropdown } from "@/features/academic/hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import useNotify from "@/hooks/useNotify";

const coursesColumns = [
  { key: "title", label: "Course Name", width: "flex-1", bold: true },
  { key: "department_name", label: "Department", width: "w-44" },
  { key: "semester_name", label: "Semester", width: "w-32" },
  { key: "is_enabled_label", label: "Status", width: "w-24" },
];

const CoursesMain = () => {
  const router = useRouter();
  const notify = useNotify();
  const { data: deptsRes, isLoading: isLoadingDepts } = useDepartmentsDropdown({ limit: 500 });
  const departmentsData = Array.isArray(deptsRes?.data) ? deptsRes.data : (deptsRes?.data?.data || []);
  const departmentsOptions = departmentsData.map((d) => ({
    label: d.name,
    value: d.name, // Match 'department_name' in table data
    meta: { code: d.code },
  }));

  const enrichedColumns = useMemo(() => {
    return coursesColumns.map((col) => {
      if (col.key === "department_name") {
        return {
          ...col,
          filterDropdown: {
            options: departmentsOptions,
            isLoading: isLoadingDepts,
            hasMore: false,
          },
        };
      }
      return col;
    });
  }, [departmentsOptions, isLoadingDepts]);

  const { data, isLoading, isError } = useCoursesList({ mode: "scroll", limit: 500 });
  const bulkDeleteMutation = useBulkDeleteCourses();

  const handleBulkDelete = (selectedIds) => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} courses?`)) {
      bulkDeleteMutation.mutate(
        { ids: selectedIds },
        {
          onSuccess: () => notify.success("Courses deleted successfully"),
          onError: (err) => notify.error(err?.message || "Failed to delete courses")
        }
      );
    }
  };

  const actions = [
    { label: "Delete", action: "delete", onClick: handleBulkDelete }
  ];

  if (isLoading) {
    return <div className="p-10 text-center">Loading courses...</div>;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500">Failed to load courses.</div>;
  }

  const rawData = data?.data?.data || data?.data || [];
  const coursesData = rawData.map(item => ({
    ...item,
    title: item.title || item.name,
    department_name: item.department?.name || item.department_name || "—",
    semester_name: item.semester?.name ? `${item.semester.name} ${item.semester.academic_year?.name || ""}` : (item.semester_label || "—"),
    is_enabled_label: item.is_enabled ? "Active" : "Inactive"
  }));

  return (
    <AcademicTable
      title="Courses"
      columns={enrichedColumns}
      data={coursesData}
      addNewLabel="Add Course"
      onAddNew={() => router.push("/admin/dashboards/admin-academic/courses/create")}
      onRowClick={(row) => router.push(`/admin/dashboards/admin-academic/courses/${row.id}`)}
      actions={actions}
    />
  );
};

export default CoursesMain;
