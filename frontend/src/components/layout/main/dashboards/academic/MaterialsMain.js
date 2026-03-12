"use client";

import AcademicTable from "@/components/shared/dashboards/AcademicTable";
import { materialsData, materialsColumns } from "@/lib/mockAcademicData";

const MaterialsMain = () => {
  return (
    <AcademicTable
      title="Materials"
      subtitle="Manage course materials and resources"
      columns={materialsColumns}
      data={materialsData}
      addNewLabel="Upload Material"
      onAddNew={() => alert("Upload Material clicked")}
    />
  );
};

export default MaterialsMain;
