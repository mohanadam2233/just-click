"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { useMaterialsList, useBulkDeleteMaterials } from "@/features/materials/hooks";
import { useRouter } from "next/navigation";
import useNotify from "@/hooks/useNotify";

const materialsColumns = [
  { key: "title", label: "Title", width: "flex-1", linkRow: true },
  { key: "course_code", label: "Course", width: "w-24", align: "center" },
  { key: "material_type", label: "Type", width: "w-24" },
  { key: "file_size_display", label: "Size", width: "w-24", align: "center" },
  { key: "is_enabled_label", label: "Status", width: "w-24" },
];

const MaterialsMain = () => {
  const router = useRouter();
  const notify = useNotify();

  const { data, isLoading, isError } = useMaterialsList({ mode: "scroll", limit: 500, is_enabled: 1 });
  const bulkDeleteMutation = useBulkDeleteMaterials();

  const handleBulkDelete = (selectedIds) => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} materials?`)) {
      bulkDeleteMutation.mutate(
        { ids: selectedIds },
        {
          onSuccess: () => notify.success("Materials deleted successfully"),
          onError: (err) => notify.error(err?.message || "Failed to delete materials")
        }
      );
    }
  };

  const actions = [
    { label: "Delete", action: "delete", onClick: handleBulkDelete }
  ];

  const enrichedColumns = useMemo(() => {
    return materialsColumns.map((col) => {
      if (col.key === "material_type") {
        return {
          ...col,
          filterDropdown: {
            options: [
              { label: "PDF Document", value: "pdf" },
              { label: "Presentation (Slides)", value: "slides" },
              { label: "Video", value: "video" },
              { label: "Other", value: "other" },
            ],
            isLoading: false,
            hasMore: false,
          },
        };
      }
      return col;
    });
  }, []);

  if (isLoading) {
    return <div className="p-10 text-center">Loading materials...</div>;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500">Failed to load materials.</div>;
  }

  const rawData = data?.data?.data || data?.data || [];
  const materialsData = rawData.map(item => ({
    ...item,
    course_code: item.course?.code || item.course_code || "—",
    file_size_display: item.file_size_mb ? `${item.file_size_mb} MB` : "—",
    is_enabled_label: item.is_enabled ? "Active" : "Inactive"
  }));

  return (
    <AcademicTable
      title="Materials"
      columns={enrichedColumns}
      data={materialsData}
      addNewLabel="Upload Material"
      onAddNew={() => router.push("/admin/dashboards/admin-academic/materials/create")}
      onRowClick={(row) => router.push(`/admin/dashboards/admin-academic/materials/${row.id}`)}
      actions={actions}
    />
  );
};

export default MaterialsMain;
