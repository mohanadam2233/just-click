"use client";

import Preloader from "@/components/shared/others/Preloader";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { useStaffList } from "@/features/people/hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import useNotify from "@/hooks/useNotify";

const staffColumns = [
  { key: "full_name", label: "Full Name", width: "flex-1", bold: true },
  { key: "staff_id", label: "Staff ID", width: "w-32" },
  { key: "department_name", label: "Department", width: "w-44" },
  { key: "status_label", label: "Status", width: "w-24" },
];

const StaffMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const { data, isLoading, isError } = useStaffList({ limit: 20 });

  if (isLoading) {
    return <Preloader />;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500">Failed to load staff.</div>;
  }

  const rawData = data?.data?.data || data?.data || [];
  const tableData = rawData.map(item => ({
    ...item,
    full_name: item.profile?.full_name || "—",
    staff_id: item.profile?.staff_id || "—",
    department_name: item.context?.department?.name || "—",
    status_label: item.flags?.is_enabled === true ? "Active" : "Inactive",
  }));

  return (
    <AcademicTable
      title="Staff Members"
      columns={staffColumns}
      data={tableData}
      addNewLabel={null}
      onAddNew={null}
      onRowClick={(row) => router.push(`/admin/dashboards/admin-people/staff/${row.id}`)}
      actions={[]}
    />
  );
};

export default StaffMain;
