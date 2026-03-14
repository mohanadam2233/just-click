"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { materialsData, materialsColumns } from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";

const MaterialsMain = () => {
  const router = useRouter();

  return (
    <AcademicTable
      title="Materials"
      subtitle="Manage course materials and resources"
      columns={materialsColumns}
      data={materialsData}
      addNewLabel="Upload Material"
      onAddNew={() => router.push("/admin/dashboards/admin-academic/materials/create")}
      onRowClick={(row) => router.push(`/admin/dashboards/admin-academic/materials/${row.id}`)}
    />
  );
};

export default MaterialsMain;
