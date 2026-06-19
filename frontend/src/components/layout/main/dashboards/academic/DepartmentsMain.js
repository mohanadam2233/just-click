"use client";

import Preloader from "@/components/shared/others/Preloader";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { useDepartmentsList, useFacultiesDropdown } from "@/features/academic/hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const departmentsColumns = [
  { key: "name", label: "Department", width: "flex-1", bold: true },
  { key: "faculty_name", label: "Faculty", width: "w-56" },
  { key: "courses_count", label: "Courses", width: "w-24" },
  { key: "is_enabled_label", label: "Status", width: "w-24" },
];

const DepartmentsMain = () => {
  const router = useRouter();
  const { data: facultiesRes, isLoading: isLoadingFaculties } = useFacultiesDropdown({ limit: 20 });
  const facultiesData = Array.isArray(facultiesRes?.data) ? facultiesRes.data : (facultiesRes?.data?.data || []);
  const facultiesOptions = facultiesData.map((f) => ({
    label: f.name,
    value: f.name, // using name to match column 'faculty_name' for local filtering
    meta: { code: f.code },
  }));

  const enrichedColumns = useMemo(() => {
    return departmentsColumns.map((col) => {
      if (col.key === "faculty_name") {
        return {
          ...col,
          filterDropdown: {
            options: facultiesOptions,
            isLoading: isLoadingFaculties,
            hasMore: false,
          },
        };
      }
      return col;
    });
  }, [facultiesOptions, isLoadingFaculties]);

  const { data, isLoading, isError } = useDepartmentsList({ mode: "scroll", limit: 20 });

  if (isLoading) {
    return <Preloader />;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500">Failed to load departments.</div>;
  }

  const rawData = data?.data?.data || data?.data || [];
  const departmentsData = rawData.map(item => ({
    ...item,
    faculty_name: item.faculty?.name || item.faculty_name || "—",
    is_enabled_label: item.is_enabled ? "Active" : "Inactive"
  }));

  return (
    <AcademicTable
      title="Departments"
      columns={enrichedColumns}
      data={departmentsData}
      addNewLabel={null}
      onAddNew={null}
      onRowClick={(row) => router.push(`/admin/dashboards/admin-academic/departments/${row.id}`)}
      actions={[]}
    />
  );
};

export default DepartmentsMain;
