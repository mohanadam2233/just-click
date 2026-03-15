"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { materialsColumns, materialsTableData } from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";

const MaterialsMain = () => {
  const router = useRouter();

  return (
    <AcademicTable
      title="Materials"
      columns={materialsColumns}
      data={materialsTableData}
      addNewLabel="Upload Material"
      onAddNew={() =>
        router.push("/admin/dashboards/admin-academic/materials/create")
      }
      onRowClick={(row) =>
        router.push(`/admin/dashboards/admin-academic/materials/${row.id}`)
      }
    />
  );
};

export default MaterialsMain;
