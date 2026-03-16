"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { facultiesColumns, facultiesTableData } from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";

const FacultiesMain = () => {
  const router = useRouter();

  return (
    <AcademicTable
      title="Faculties"
      columns={facultiesColumns}
      data={facultiesTableData}
      addNewLabel="Add Faculty"
      onAddNew={() =>
        router.push("/admin/dashboards/admin-academic/faculties/create")
      }
      onRowClick={(row) =>
        router.push(`/admin/dashboards/admin-academic/faculties/${row.id}`)
      }
    />
  );
};

export default FacultiesMain;
