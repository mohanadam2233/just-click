"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import {
  departmentsColumns,
  departmentsTableData,
} from "@/lib/mockAcademicData";
import { useRouter } from "next/navigation";

const DepartmentsMain = () => {
  const router = useRouter();

  return (
    <AcademicTable
      title="Departments"
      columns={departmentsColumns}
      data={departmentsTableData}
      addNewLabel="Add Department"
      onAddNew={() =>
        router.push("/admin/dashboards/admin-academic/departments/create")
      }
      onRowClick={(row) =>
        router.push(`/admin/dashboards/admin-academic/departments/${row.id}`)
      }
    />
  );
};

export default DepartmentsMain;
