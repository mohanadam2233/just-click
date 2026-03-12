"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { facultiesData, facultiesColumns } from "@/lib/mockAcademicData";

const FacultiesMain = () => {
  return (
    <AcademicTable
      title="Faculties"
      subtitle="Manage all university faculties"
      columns={facultiesColumns}
      data={facultiesData}
      addNewLabel="Add Faculty"
      onAddNew={() => alert("Add Faculty clicked")}
    />
  );
};

export default FacultiesMain;
