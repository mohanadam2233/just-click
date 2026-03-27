"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { useFacultiesList, useBulkDeleteFaculties } from "@/features/academic/hooks";
import { useRouter } from "next/navigation";
import useNotify from "@/hooks/useNotify";

const facultiesColumns = [
  { key: "code", label: "Code", width: "w-24", bold: true },
  { key: "name", label: "Faculty Name", width: "flex-1", bold: true },
  { key: "departments_count", label: "Departments", width: "w-28" },
  { key: "is_enabled_label", label: "Status", width: "w-24" },
];

const FacultiesMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const { data, isLoading, isError } = useFacultiesList({ mode: "scroll", limit: 500 });
  const bulkDeleteMutation = useBulkDeleteFaculties();

  const handleBulkDelete = (selectedIds) => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} faculties?`)) {
      bulkDeleteMutation.mutate(
        { ids: selectedIds },
        {
          onSuccess: () => notify.success("Faculties deleted successfully"),
          onError: (err) => notify.error(err?.message || "Failed to delete faculties")
        }
      );
    }
  };

  const actions = [
    { label: "Delete", action: "delete", onClick: handleBulkDelete }
  ];

  if (isLoading) {
    return <div className="p-10 text-center">Loading faculties...</div>;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500">Failed to load faculties.</div>;
  }

  const rawData = data?.data?.data || data?.data || [];
  const facultiesData = rawData.map(item => ({
    ...item,
    is_enabled_label: item.is_enabled ? "Active" : "Inactive"
  }));

  return (
    <AcademicTable
      title="Faculties"
      columns={facultiesColumns}
      data={facultiesData}
      addNewLabel="Add Faculty"
      onAddNew={() => router.push("/admin/dashboards/admin-academic/faculties/create")}
      onRowClick={(row) => router.push(`/admin/dashboards/admin-academic/faculties/${row.id}`)}
      actions={actions}
    />
  );
};

export default FacultiesMain;
