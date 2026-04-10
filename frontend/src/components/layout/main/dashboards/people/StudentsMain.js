"use client";

import Preloader from "@/components/shared/others/Preloader";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { useStudentsList } from "@/features/people/hooks";
import { useDepartmentsDropdown } from "@/features/academic/hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import useNotify from "@/hooks/useNotify";

const studentsColumns = [
  { key: "full_name", label: "Full Name", width: "flex-1", bold: true },
  { key: "student_id", label: "Student ID", width: "w-32" },
  { key: "department_name", label: "Department", width: "w-44" },
  { key: "status_label", label: "Status", width: "w-24" },
];

const StudentsMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const { data: deptsRes, isLoading: isLoadingDepts } = useDepartmentsDropdown({ limit: 20 });
  const departmentsData = Array.isArray(deptsRes?.data) ? deptsRes.data : (deptsRes?.data?.data || []);
  const departmentsOptions = departmentsData.map((d) => ({
    label: d.name,
    value: d.id, // we might filter by ID, depends on the API
    meta: { code: d.code },
  }));

  const enrichedColumns = useMemo(() => {
    return studentsColumns.map((col) => {
      /* if (col.key === "department_name") {
        return {
          ...col,
          filterDropdown: {
            options: departmentsOptions,
            isLoading: isLoadingDepts,
            hasMore: false,
          },
        };
      } */
      return col;
    });
  }, [departmentsOptions, isLoadingDepts]);

  const { data, isLoading, isError } = useStudentsList({ limit: 20 });

  if (isLoading) {
    return <Preloader />;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500">Failed to load students.</div>;
  }

  const rawData = data?.data?.data || data?.data || [];
  const tableData = rawData.map(item => ({
    ...item,
    full_name: item.profile?.full_name || "—",
    student_id: item.profile?.student_id || "—",
    department_name: item.context?.department?.name || "—",
    status_label: item.flags?.is_enabled === true ? "Active" : "Inactive",
  }));

  return (
    <AcademicTable
      title="Students"
      columns={enrichedColumns}
      data={tableData}
      addNewLabel={null}
      onAddNew={null}
      onRowClick={(row) => router.push(`/admin/dashboards/admin-people/students/${row.id}`)}
      actions={[]} // we can add bulk actions later if needed
    />
  );
};

export default StudentsMain;
